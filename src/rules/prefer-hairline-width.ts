import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/enzomanuelmangano/eslint-plugin-refined/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'useHairlineWidth';
type Options = [{ threshold?: number }?];

export = createRule<Options, MessageIds>({
  name: 'prefer-hairline-width',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer StyleSheet.hairlineWidth for border widths less than a threshold (default 0.3)',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            default: 0.3,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useHairlineWidth: 'Use StyleSheet.hairlineWidth instead of {{value}} for consistent thin borders across devices',
    },
  },
  defaultOptions: [{ threshold: 0.3 }],
  create(context, options) {
    const threshold = options[0]?.threshold ?? 0.3;
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

          // Check if the value is a number less than threshold
          if (isNumericLiteral(value)) {
            const numValue = value.value;
            if (numValue <= threshold && numValue > 0) {
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
