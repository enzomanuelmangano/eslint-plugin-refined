import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/enzomanuelmangano/eslint-plugin-refined/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'avoidTouchableOpacity';
type Options = [];

export = createRule<Options, MessageIds>({
  name: 'avoid-touchable-opacity',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Discourage usage of TouchableOpacity',
    },
    schema: [],
    messages: {
      avoidTouchableOpacity:
        'Avoid using TouchableOpacity - you should care about your touchables',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      // Check for JSX usage: <TouchableOpacity>
      JSXOpeningElement(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'TouchableOpacity'
        ) {
          context.report({
            node: node.name,
            messageId: 'avoidTouchableOpacity',
          });
        }
      },
    };
  },
});
