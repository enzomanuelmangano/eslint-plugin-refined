import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/enzomanuelmangano/eslint-plugin-refined/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'incompleteSpringConfig' | 'addMissingParams';
type Options = [{ reanimatedVersion?: 'v3' | 'v4' }?];

export = createRule<Options, MessageIds>({
  name: 'spring-config-consistency',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that spring animations (withSpring and Transition.springify) either have all spring physics params (mass, damping, stiffness) or none of them',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          reanimatedVersion: {
            type: 'string',
            enum: ['v3', 'v4'],
            default: 'v4',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      incompleteSpringConfig:
        'Spring animation must include all three spring physics params (mass, damping, stiffness) or none of them. Currently missing: {{missing}}',
      addMissingParams: 'Add missing spring physics parameters',
    },
  },
  defaultOptions: [{ reanimatedVersion: 'v4' }],
  create(context, options) {
    const reanimatedVersion = options[0]?.reanimatedVersion ?? 'v4';

    // Track the root of transition chains we've already processed
    const processedChains = new WeakSet<TSESTree.Node>();

    function checkWithSpringCall(node: TSESTree.CallExpression) {
      // Check if this is a withSpring call
      if (
        node.callee.type !== 'Identifier' ||
        node.callee.name !== 'withSpring'
      ) {
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
      const springParamsCount = [hasMass, hasDamping, hasStiffness].filter(
        Boolean
      ).length;

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
            const lastProp =
              configArg.properties[configArg.properties.length - 1];
            if (!lastProp || lastProp.type !== 'Property') {
              return null;
            }

            // Get indentation from the config object
            const configStartLine =
              sourceCode.lines[configArg.loc.start.line - 1];
            const indent = configStartLine?.match(/^(\s*)/)?.[1] || '';
            const propIndent = indent + '  ';

            // Default values for missing params based on Reanimated version
            const defaults: Record<string, number> =
              reanimatedVersion === 'v3'
                ? { mass: 4, damping: 10, stiffness: 100 }
                : { mass: 4, damping: 120, stiffness: 900 };

            // Build the properties to add
            const propsToAdd = missing
              .map((param) => `${param}: ${defaults[param]}`)
              .join(`,\n${propIndent}`);

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

    function checkTransitionSpringify(node: TSESTree.CallExpression) {
      // Check if this is a .springify() call on a Transition
      // Pattern: LinearTransition.springify()
      if (
        node.callee.type !== 'MemberExpression' ||
        node.callee.property.type !== 'Identifier' ||
        node.callee.property.name !== 'springify'
      ) {
        return;
      }

      // Check if the object is a transition type (ends with "Transition")
      let isTransition = false;
      if (
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name.endsWith('Transition')
      ) {
        isTransition = true;
      }

      if (!isTransition) {
        return;
      }

      // Find the end of the chain (walk up from springify())
      let current: TSESTree.Node = node;
      let chainEnd: TSESTree.CallExpression = node;

      // Walk up to find the end of the method chain
      // Pattern: node is part of MemberExpression, which is callee of CallExpression
      while (current.parent) {
        // Check if parent is a MemberExpression that uses this call as its object
        if (
          current.parent.type === 'MemberExpression' &&
          current.parent.object === current &&
          current.parent.parent &&
          current.parent.parent.type === 'CallExpression' &&
          current.parent.parent.callee === current.parent
        ) {
          chainEnd = current.parent.parent;
          current = current.parent.parent;
        } else {
          break;
        }
      }

      // Don't process the same chain multiple times
      if (processedChains.has(chainEnd)) {
        return;
      }
      processedChains.add(chainEnd);

      // Collect all chained methods
      const chainedMethods = new Map<string, TSESTree.CallExpression>();
      let currentNode: TSESTree.Node = chainEnd;

      while (currentNode.type === 'CallExpression') {
        if (
          currentNode.callee.type === 'MemberExpression' &&
          currentNode.callee.property.type === 'Identifier'
        ) {
          const methodName = currentNode.callee.property.name;
          if (
            methodName === 'mass' ||
            methodName === 'damping' ||
            methodName === 'stiffness'
          ) {
            chainedMethods.set(methodName, currentNode);
          }
        }

        // Move down the chain
        if (currentNode.callee.type === 'MemberExpression') {
          currentNode = currentNode.callee.object;
        } else {
          break;
        }
      }

      const hasMass = chainedMethods.has('mass');
      const hasDamping = chainedMethods.has('damping');
      const hasStiffness = chainedMethods.has('stiffness');

      const springParamsCount = [hasMass, hasDamping, hasStiffness].filter(
        Boolean
      ).length;

      // If we have some but not all params, report an error
      if (springParamsCount > 0 && springParamsCount < 3) {
        const missing: string[] = [];
        if (!hasMass) missing.push('mass');
        if (!hasDamping) missing.push('damping');
        if (!hasStiffness) missing.push('stiffness');

        // Default values for missing params based on Reanimated version
        const defaults: Record<string, number> =
          reanimatedVersion === 'v3'
            ? { mass: 4, damping: 10, stiffness: 100 }
            : { mass: 4, damping: 120, stiffness: 900 };

        context.report({
          node: chainEnd,
          messageId: 'incompleteSpringConfig',
          data: {
            missing: missing.join(', '),
          },
          fix(fixer) {
            const sourceCode = context.sourceCode;

            // Build the missing method calls
            const missingCalls = missing
              .map((param) => `.${param}(${defaults[param]})`)
              .join('');

            // Insert after the last token of the chain
            const lastToken = sourceCode.getLastToken(chainEnd);
            if (!lastToken) {
              return null;
            }

            return fixer.insertTextAfter(lastToken, missingCalls);
          },
        });
      }
    }

    return {
      CallExpression(node) {
        checkWithSpringCall(node);
        checkTransitionSpringify(node);
      },
    };
  },
});
