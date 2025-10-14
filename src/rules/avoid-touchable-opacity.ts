import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-repo/eslint-plugin-react-native-style/blob/main/docs/rules/${name}.md`
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
      avoidTouchableOpacity: 'Avoid using TouchableOpacity - consider alternatives for better performance',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      // Check for JSX usage: <TouchableOpacity>
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'TouchableOpacity') {
          context.report({
            node: node.name,
            messageId: 'avoidTouchableOpacity',
          });
        }
      },
    };
  },
});
