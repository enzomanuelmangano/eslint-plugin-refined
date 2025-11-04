import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/enzomanuelmangano/eslint-plugin-refined/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'missingBorderCurve' | 'unnecessaryBorderCurve';
type Options = [];

export = createRule<Options, MessageIds>({
  name: 'border-radius-with-curve',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce borderCurve: "continuous" when borderRadius properties are used',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingBorderCurve:
        'When using borderRadius properties, you should also specify borderCurve: "continuous" for beautiful rounded corners on iOS',
      unnecessaryBorderCurve:
        'borderCurve has no effect on circular shapes (when borderRadius >= half of width/height or >= 9999)',
    },
  },
  defaultOptions: [],
  create(context) {
    const borderRadiusProperties = new Set([
      'borderRadius',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
      'borderTopStartRadius',
      'borderTopEndRadius',
      'borderBottomStartRadius',
      'borderBottomEndRadius',
    ]);

    function isCircularBorderRadius(node: TSESTree.ObjectExpression): boolean {
      let borderRadius: number | undefined;
      let width: number | undefined;
      let height: number | undefined;

      for (const prop of node.properties) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const propName = prop.key.name;
          const value = prop.value;

          // Extract borderRadius value
          if (
            propName === 'borderRadius' &&
            value.type === 'Literal' &&
            typeof value.value === 'number'
          ) {
            borderRadius = value.value;
          }

          // Extract width value
          if (
            propName === 'width' &&
            value.type === 'Literal' &&
            typeof value.value === 'number'
          ) {
            width = value.value;
          }

          // Extract height value
          if (
            propName === 'height' &&
            value.type === 'Literal' &&
            typeof value.value === 'number'
          ) {
            height = value.value;
          }
        }
      }

      // If borderRadius is very large (>= 9999), it's intended to create a circle
      if (borderRadius !== undefined && borderRadius >= 9999) {
        return true;
      }

      // If borderRadius is half or more of width or height, it creates a circle
      if (
        borderRadius !== undefined &&
        width !== undefined &&
        borderRadius >= width / 2
      ) {
        return true;
      }

      if (
        borderRadius !== undefined &&
        height !== undefined &&
        borderRadius >= height / 2
      ) {
        return true;
      }

      return false;
    }

    function checkStyleObject(node: TSESTree.ObjectExpression) {
      let hasBorderRadius = false;
      let hasBorderCurve = false;
      let borderCurveProp: TSESTree.Property | null = null;
      let lastProperty: TSESTree.Property | null = null;

      // Check all properties in the style object
      for (const prop of node.properties) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const propName = prop.key.name;

          if (borderRadiusProperties.has(propName)) {
            hasBorderRadius = true;
          }

          if (propName === 'borderCurve') {
            hasBorderCurve = true;
            borderCurveProp = prop;
          }

          lastProperty = prop;
        }
      }

      const isCircular = isCircularBorderRadius(node);

      // If borderRadius creates a perfect circle AND has borderCurve, report it as unnecessary
      if (isCircular && hasBorderCurve && borderCurveProp) {
        context.report({
          node: borderCurveProp,
          messageId: 'unnecessaryBorderCurve',
          fix(fixer) {
            const sourceCode = context.sourceCode;

            // Find the comma before or after this property
            const tokenBefore = sourceCode.getTokenBefore(borderCurveProp);
            const tokenAfter = sourceCode.getTokenAfter(borderCurveProp);

            const hasCommaBefore =
              tokenBefore &&
              tokenBefore.type === 'Punctuator' &&
              tokenBefore.value === ',';
            const hasCommaAfter =
              tokenAfter &&
              tokenAfter.type === 'Punctuator' &&
              tokenAfter.value === ',';

            if (hasCommaAfter) {
              // Remove property and trailing comma, including whitespace after
              const nextToken = sourceCode.getTokenAfter(tokenAfter, {
                includeComments: true,
              });
              if (nextToken) {
                const textBetween = sourceCode.text.substring(
                  tokenAfter.range[1],
                  nextToken.range[0]
                );
                if (/^\s*$/.test(textBetween)) {
                  return fixer.removeRange([
                    borderCurveProp.range[0],
                    nextToken.range[0],
                  ]);
                }
              }
              return fixer.removeRange([
                borderCurveProp.range[0],
                tokenAfter.range[1],
              ]);
            } else if (hasCommaBefore) {
              // Remove comma before and property
              return fixer.removeRange([
                tokenBefore.range[0],
                borderCurveProp.range[1],
              ]);
            } else {
              // Just remove the property
              return fixer.remove(borderCurveProp);
            }
          },
        });
        return;
      }

      // Skip if borderRadius creates a perfect circle (no need to add borderCurve)
      if (isCircular) {
        return;
      }

      // If borderRadius is used but borderCurve is not present, report an error
      if (hasBorderRadius && !hasBorderCurve) {
        context.report({
          node,
          messageId: 'missingBorderCurve',
          fix(fixer) {
            // Add borderCurve: 'continuous' after the last property
            if (lastProperty) {
              const sourceCode = context.sourceCode;
              const lastToken = sourceCode.getLastToken(lastProperty);

              if (lastToken) {
                // Get the line containing the last property to determine indentation
                const propertyStartLine =
                  sourceCode.lines[lastProperty.loc.start.line - 1];
                const indent = propertyStartLine?.match(/^\s*/)?.[0] || '  ';

                return fixer.insertTextAfter(
                  lastToken,
                  `,\n${indent}borderCurve: 'continuous'`
                );
              }
            }
            return null;
          },
        });
      }
    }

    function isInsideAnimatedStyle(node: TSESTree.Node): boolean {
      let current = node.parent;
      while (current) {
        // Check if inside useAnimatedStyle, useAnimatedReaction, useDerivedValue, etc.
        if (
          current.type === 'CallExpression' &&
          current.callee.type === 'Identifier' &&
          (current.callee.name.startsWith('useAnimated') ||
            current.callee.name === 'useDerivedValue' ||
            current.callee.name === 'runOnUI' ||
            current.callee.name === 'runOnJS')
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    function isInStyleSheetCreate(node: TSESTree.Node): boolean {
      // Check if this object is inside StyleSheet.create({ ... })
      if (!node.parent || node.parent.type !== 'Property') {
        return false;
      }

      const parent = node.parent.parent; // Move up from Property to ObjectExpression
      if (!parent || parent.type !== 'ObjectExpression') {
        return false;
      }

      const grandParent = parent.parent; // Move up from ObjectExpression
      if (!grandParent || grandParent.type !== 'CallExpression') {
        return false;
      }

      return (
        grandParent.callee.type === 'MemberExpression' &&
        grandParent.callee.object.type === 'Identifier' &&
        grandParent.callee.object.name === 'StyleSheet' &&
        grandParent.callee.property.type === 'Identifier' &&
        grandParent.callee.property.name === 'create'
      );
    }

    function isInlineStyleProp(node: TSESTree.Node): boolean {
      // Check if this object is inside a JSX style attribute
      let current = node.parent;
      while (current) {
        if (
          current.type === 'JSXExpressionContainer' &&
          current.parent?.type === 'JSXAttribute'
        ) {
          const attr = current.parent as TSESTree.JSXAttribute;
          if (
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'style'
          ) {
            return true;
          }
        }
        current = current.parent;
      }
      return false;
    }

    return {
      ObjectExpression(node) {
        // Skip if inside animated style functions
        if (isInsideAnimatedStyle(node)) {
          return;
        }

        // Only check objects that are:
        // 1. Inside StyleSheet.create() OR
        // 2. Inside JSX style prop
        if (isInStyleSheetCreate(node) || isInlineStyleProp(node)) {
          checkStyleObject(node);
        }
      },
    };
  },
});
