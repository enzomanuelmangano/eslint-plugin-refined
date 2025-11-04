import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/enzomanuelmangano/eslint-plugin-refined/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'requireHitSlop';
type Options = [{ minSize?: number }?];

interface StyleProperties {
  width?: number;
  height?: number;
}

export = createRule<Options, MessageIds>({
  name: 'require-hitslop-small-touchables',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require hitSlop on small touchable elements to improve tap target size',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          minSize: {
            type: 'number',
            minimum: 0,
            default: 40,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireHitSlop:
        'Touchable element is {{width}}x{{height}}pt (recommended minimum: {{minSize}}pt). Consider adding hitSlop for better accessibility.',
    },
  },
  defaultOptions: [{ minSize: 40 }],
  create(context, options) {
    const minSize = options[0]?.minSize ?? 40;

    // Track StyleSheet.create() calls in the file
    const styleSheets = new Map<string, Map<string, StyleProperties>>();

    // Collect JSX elements to check at the end (two-pass approach)
    const elementsToCheck: TSESTree.JSXOpeningElement[] = [];

    const touchableProps = new Set([
      'onPress',
      'onLongPress',
      'onPressIn',
      'onPressOut',
      'onTouchStart',
      'onTouchEnd',
    ]);

    function parseStyleObject(
      node: TSESTree.ObjectExpression
    ): StyleProperties {
      const result: StyleProperties = {};

      for (const prop of node.properties) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const propName = prop.key.name;

          if (
            (propName === 'width' || propName === 'height') &&
            prop.value.type === 'Literal' &&
            typeof prop.value.value === 'number'
          ) {
            result[propName] = prop.value.value;
          }
        }
      }

      return result;
    }

    function getStyleFromReference(
      styleName: string,
      objectName?: string
    ): StyleProperties | null {
      // Handle styles.icon or just icon
      const sheetName = objectName || 'styles';
      const sheet = styleSheets.get(sheetName);

      if (sheet) {
        return sheet.get(styleName) || null;
      }

      return null;
    }

    function extractStyleProperties(
      styleNode: TSESTree.Node
    ): StyleProperties | null {
      // Inline style object: style={{ width: 30, height: 30 }}
      if (styleNode.type === 'ObjectExpression') {
        return parseStyleObject(styleNode);
      }

      // Style reference: style={styles.icon}
      if (styleNode.type === 'MemberExpression') {
        if (
          styleNode.object.type === 'Identifier' &&
          styleNode.property.type === 'Identifier'
        ) {
          return getStyleFromReference(
            styleNode.property.name,
            styleNode.object.name
          );
        }
      }

      // Style array: style={[styles.base, styles.icon]}
      if (styleNode.type === 'ArrayExpression') {
        let merged: StyleProperties = {};

        for (const element of styleNode.elements) {
          if (element) {
            const props = extractStyleProperties(element);
            if (props) {
              merged = { ...merged, ...props };
            }
          }
        }

        return Object.keys(merged).length > 0 ? merged : null;
      }

      return null;
    }

    function hasTouchableCallback(
      attributes: TSESTree.JSXAttribute[]
    ): boolean {
      return attributes.some(
        (attr) =>
          attr.name.type === 'JSXIdentifier' &&
          touchableProps.has(attr.name.name)
      );
    }

    function hasHitSlopProp(attributes: TSESTree.JSXAttribute[]): boolean {
      return attributes.some(
        (attr) =>
          attr.name.type === 'JSXIdentifier' && attr.name.name === 'hitSlop'
      );
    }

    function getStyleProp(
      attributes: TSESTree.JSXAttribute[]
    ): TSESTree.Node | null {
      const styleProp = attributes.find(
        (attr) =>
          attr.name.type === 'JSXIdentifier' && attr.name.name === 'style'
      );

      if (styleProp?.value?.type === 'JSXExpressionContainer') {
        return styleProp.value.expression;
      }

      return null;
    }

    return {
      // Track StyleSheet.create() calls
      CallExpression(node) {
        // Look for StyleSheet.create({ ... })
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'StyleSheet' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'create' &&
          node.arguments[0]?.type === 'ObjectExpression'
        ) {
          const stylesObject = node.arguments[0];

          // Find the variable name this is assigned to
          let variableName = 'styles';
          const parent = node.parent;

          if (
            parent?.type === 'VariableDeclarator' &&
            parent.id.type === 'Identifier'
          ) {
            variableName = parent.id.name;
          }

          const styleMap = new Map<string, StyleProperties>();

          // Parse each style definition
          for (const prop of stylesObject.properties) {
            if (
              prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.value.type === 'ObjectExpression'
            ) {
              const styleName = prop.key.name;
              const styleProps = parseStyleObject(prop.value);
              styleMap.set(styleName, styleProps);
            }
          }

          styleSheets.set(variableName, styleMap);
        }
      },

      // Collect JSX elements with touchable callbacks for later checking
      JSXOpeningElement(node) {
        const attributes = node.attributes.filter(
          (attr): attr is TSESTree.JSXAttribute => attr.type === 'JSXAttribute'
        );

        // Only collect elements with press handlers
        if (!hasTouchableCallback(attributes)) {
          return;
        }

        // Collect for later checking
        elementsToCheck.push(node);
      },

      // Check all collected elements at the end of the file
      'Program:exit'() {
        for (const node of elementsToCheck) {
          const attributes = node.attributes.filter(
            (attr): attr is TSESTree.JSXAttribute =>
              attr.type === 'JSXAttribute'
          );

          // Skip if already has hitSlop
          if (hasHitSlopProp(attributes)) {
            continue;
          }

          // Get style prop
          const styleProp = getStyleProp(attributes);
          if (!styleProp) {
            continue;
          }

          // Extract dimensions
          const styleProps = extractStyleProperties(styleProp);
          if (!styleProps) {
            continue;
          }

          const { width, height } = styleProps;

          // Check if either dimension is below threshold
          if (
            (width !== undefined && width < minSize) ||
            (height !== undefined && height < minSize)
          ) {
            // Calculate required hitSlop to reach minSize
            // hitSlop adds padding on all sides, so total touchable area = size + (hitSlop * 2)
            const widthHitSlop =
              width !== undefined
                ? Math.max(0, Math.ceil((minSize - width) / 2))
                : 0;
            const heightHitSlop =
              height !== undefined
                ? Math.max(0, Math.ceil((minSize - height) / 2))
                : 0;
            const requiredHitSlop = Math.max(widthHitSlop, heightHitSlop);

            context.report({
              node,
              messageId: 'requireHitSlop',
              data: {
                width: width?.toString() ?? 'unknown',
                height: height?.toString() ?? 'unknown',
                minSize: minSize.toString(),
              },
              fix(fixer) {
                // Find the last attribute
                const lastAttr = attributes[attributes.length - 1];
                if (!lastAttr) {
                  return null;
                }

                // Insert hitSlop after the last attribute
                return fixer.insertTextAfter(
                  lastAttr,
                  ` hitSlop={${requiredHitSlop}}`
                );
              },
            });
          }
        }
      },
    };
  },
});
