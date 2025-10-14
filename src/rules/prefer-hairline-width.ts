import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-repo/eslint-plugin-react-native-style/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'useHairlineWidth';
type Options = [];

export = createRule<Options, MessageIds>({
  name: 'prefer-hairline-width',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer StyleSheet.hairlineWidth for border widths less than 1',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useHairlineWidth: 'Use StyleSheet.hairlineWidth instead of {{value}} for consistent thin borders across devices',
    },
  },
  defaultOptions: [],
  create(context) {
    const borderWidthProperties = new Set([
      'borderWidth',
      'borderTopWidth',
      'borderBottomWidth',
      'borderLeftWidth',
      'borderRightWidth',
      'borderStartWidth',
      'borderEndWidth',
    ]);

    function isNumericLiteral(node: TSESTree.Node): node is TSESTree.Literal & { value: number } {
      return node.type === 'Literal' && typeof node.value === 'number';
    }

    return {
      Property(node) {
        // Check if this is a border width property
        if (node.key.type === 'Identifier' && borderWidthProperties.has(node.key.name)) {
          const value = node.value;

          // Check if the value is a number less than 1
          if (isNumericLiteral(value)) {
            const numValue = value.value;
            if (numValue < 1 && numValue > 0) {
              context.report({
                node: value,
                messageId: 'useHairlineWidth',
                data: {
                  value: String(numValue),
                },
                fix(fixer) {
                  // Replace the numeric value with StyleSheet.hairlineWidth
                  return fixer.replaceText(value, 'StyleSheet.hairlineWidth');
                },
              });
            }
          }
        }
      },
    };
  },
});
