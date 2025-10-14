import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/your-repo/eslint-plugin-react-native-style/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'incompleteSpringConfig' | 'addMissingParams';
type Options = [];

export = createRule<Options, MessageIds>({
  name: 'spring-config-consistency',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that withSpring either has all spring physics params (mass, damping, stiffness) or none of them',
    },
    fixable: 'code',
    schema: [],
    messages: {
      incompleteSpringConfig: 'withSpring config must include all three spring physics params (mass, damping, stiffness) or none of them. Currently missing: {{missing}}',
      addMissingParams: 'Add missing spring physics parameters',
    },
  },
  defaultOptions: [],
  create(context) {
    function checkWithSpringCall(node: TSESTree.CallExpression) {
      // Check if this is a withSpring call
      if (node.callee.type !== 'Identifier' || node.callee.name !== 'withSpring') {
        return;
      }

      // withSpring must have at least one argument (the value)
      if (node.arguments.length < 2) {
        return;
      }

      const configArg = node.arguments[1];

      // Config must be an object expression
      if (!configArg || configArg.type !== 'ObjectExpression') {
        return;
      }

      let hasMass = false;
      let hasDamping = false;
      let hasStiffness = false;
      let hasDuration = false;
      let hasDampingRatio = false;

      // Check what properties are present
      for (const prop of configArg.properties) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const propName = prop.key.name;

          if (propName === 'mass') hasMass = true;
          if (propName === 'damping') hasDamping = true;
          if (propName === 'stiffness') hasStiffness = true;
          if (propName === 'duration') hasDuration = true;
          if (propName === 'dampingRatio') hasDampingRatio = true;
        }
      }

      // If duration or dampingRatio are present, skip this check
      // (these are alternative spring config modes)
      if (hasDuration || hasDampingRatio) {
        return;
      }

      // Check if we have partial spring physics params
      const springParamsCount = [hasMass, hasDamping, hasStiffness].filter(Boolean).length;

      // If we have some but not all params, report an error
      if (springParamsCount > 0 && springParamsCount < 3) {
        const missing: string[] = [];
        if (!hasMass) missing.push('mass');
        if (!hasDamping) missing.push('damping');
        if (!hasStiffness) missing.push('stiffness');

        context.report({
          node: configArg,
          messageId: 'incompleteSpringConfig',
          data: {
            missing: missing.join(', '),
          },
          fix(fixer) {
            const sourceCode = context.sourceCode;

            // Find the last property in the config object
            const lastProp = configArg.properties[configArg.properties.length - 1];
            if (!lastProp || lastProp.type !== 'Property') {
              return null;
            }

            // Get indentation from the config object
            const configStartLine = sourceCode.lines[configArg.loc.start.line - 1];
            const indent = configStartLine?.match(/^(\s*)/)?.[1] || '';
            const propIndent = indent + '  ';

            // Default values for missing params
            const defaults: Record<string, number> = {
              mass: 1,
              damping: 10,
              stiffness: 100,
            };

            // Build the properties to add
            const propsToAdd = missing.map(param => `${param}: ${defaults[param]}`).join(`,\n${propIndent}`);

            // Insert after the last property
            const lastToken = sourceCode.getLastToken(lastProp);
            if (!lastToken) {
              return null;
            }

            return fixer.insertTextAfter(
              lastToken,
              `,\n${propIndent}${propsToAdd}`
            );
          },
        });
      }
    }

    return {
      CallExpression(node) {
        checkWithSpringCall(node);
      },
    };
  },
});
