import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-repo/eslint-plugin-react-native-style/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'preferBoxShadow';
type Options = [];

export default createRule<Options, MessageIds>({
  name: 'prefer-box-shadow',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer boxShadow over shadowColor, shadowOffset, shadowOpacity, and shadowRadius',
    },
    schema: [],
    messages: {
      preferBoxShadow: 'Consider using boxShadow instead of individual shadow properties (shadowColor, shadowOffset, shadowOpacity, shadowRadius) for better performance and simpler syntax',
    },
  },
  defaultOptions: [],
  create(context) {
    const shadowProperties = new Set([
      'shadowColor',
      'shadowOffset',
      'shadowOpacity',
      'shadowRadius',
    ]);

    function checkStyleObject(node: TSESTree.ObjectExpression) {
      const foundShadowProps: string[] = [];

      // Check all properties in the style object
      for (const prop of node.properties) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const propName = prop.key.name;

          if (shadowProperties.has(propName)) {
            foundShadowProps.push(propName);
          }
        }
      }

      // If shadowColor is used, suggest boxShadow
      if (foundShadowProps.includes('shadowColor')) {
        // Find the shadowColor property node
        for (const prop of node.properties) {
          if (prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'shadowColor') {
            context.report({
              node: prop,
              messageId: 'preferBoxShadow',
            });
            break;
          }
        }
      }
    }

    return {
      ObjectExpression(node) {
        checkStyleObject(node);
      },
    };
  },
});
