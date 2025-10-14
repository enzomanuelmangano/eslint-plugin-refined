import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-repo/eslint-plugin-react-native-style/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'missingBorderCurve' | 'unnecessaryBorderCurve';
type Options = [];

export = createRule<Options, MessageIds>({
  name: 'border-radius-with-curve',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce borderCurve: "continuous" when borderRadius properties are used',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingBorderCurve: 'When using borderRadius properties, you should also specify borderCurve: "continuous" for better visual quality on iOS',
      unnecessaryBorderCurve: 'borderCurve has no effect on circular shapes (when borderRadius >= half of width/height or >= 9999)',
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
          if (propName === 'borderRadius' && value.type === 'Literal' && typeof value.value === 'number') {
            borderRadius = value.value;
          }

          // Extract width value
          if (propName === 'width' && value.type === 'Literal' && typeof value.value === 'number') {
            width = value.value;
          }

          // Extract height value
          if (propName === 'height' && value.type === 'Literal' && typeof value.value === 'number') {
            height = value.value;
          }
        }
      }

      // If borderRadius is very large (>= 9999), it's intended to create a circle
      if (borderRadius !== undefined && borderRadius >= 9999) {
        return true;
      }

      // If borderRadius is half or more of width or height, it creates a circle
      if (borderRadius !== undefined && width !== undefined && borderRadius >= width / 2) {
        return true;
      }

      if (borderRadius !== undefined && height !== undefined && borderRadius >= height / 2) {
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

            const hasCommaBefore = tokenBefore && tokenBefore.type === 'Punctuator' && tokenBefore.value === ',';
            const hasCommaAfter = tokenAfter && tokenAfter.type === 'Punctuator' && tokenAfter.value === ',';

            if (hasCommaAfter) {
              // Remove property and trailing comma, including whitespace after
              const nextToken = sourceCode.getTokenAfter(tokenAfter, { includeComments: true });
              if (nextToken) {
                const textBetween = sourceCode.text.substring(tokenAfter.range[1], nextToken.range[0]);
                if (/^\s*$/.test(textBetween)) {
                  return fixer.removeRange([borderCurveProp.range[0], nextToken.range[0]]);
                }
              }
              return fixer.removeRange([borderCurveProp.range[0], tokenAfter.range[1]]);
            } else if (hasCommaBefore) {
              // Remove comma before and property
              return fixer.removeRange([tokenBefore.range[0], borderCurveProp.range[1]]);
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
                const propertyStartLine = sourceCode.lines[lastProperty.loc.start.line - 1];
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

    return {
      ObjectExpression(node) {
        // Check if this could be a style object
        // We're checking all object expressions that might be styles
        checkStyleObject(node);
      },
    };
  },
});
