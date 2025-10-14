import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-repo/eslint-plugin-react-native-style/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'missingBorderCurve';
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

    function checkStyleObject(node: TSESTree.ObjectExpression) {
      let hasBorderRadius = false;
      let hasBorderCurve = false;
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
          }

          lastProperty = prop;
        }
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
