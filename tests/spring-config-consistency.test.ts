import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import * as tsParser from '@typescript-eslint/parser';
import rule from '../src/rules/spring-config-consistency';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

ruleTester.run('spring-config-consistency', rule, {
  valid: [
    // No config object at all
    {
      code: `
        const value = withSpring(100);
      `,
    },
    // Config with no spring physics params
    {
      code: `
        const value = withSpring(100, {
          overshootClamping: true,
        });
      `,
    },
    // Config with all three spring physics params
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
          damping: 10,
          stiffness: 100,
        });
      `,
    },
    // Config with all three params plus other options
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
          damping: 10,
          stiffness: 100,
          overshootClamping: true,
        });
      `,
    },
    // Config with duration (alternative mode - should be ignored)
    {
      code: `
        const value = withSpring(100, {
          duration: 1000,
        });
      `,
    },
    // Config with dampingRatio (alternative mode - should be ignored)
    {
      code: `
        const value = withSpring(100, {
          dampingRatio: 0.5,
        });
      `,
    },
    // Config with duration and partial spring params (should be ignored)
    {
      code: `
        const value = withSpring(100, {
          duration: 1000,
          mass: 1,
        });
      `,
    },
    // Config with dampingRatio and partial spring params (should be ignored)
    {
      code: `
        const value = withSpring(100, {
          dampingRatio: 0.5,
          stiffness: 100,
        });
      `,
    },
  ],
  invalid: [
    // Only mass
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'damping, stiffness' }
      }],
      output: `
        const value = withSpring(100, {
          mass: 1,
          damping: 10,
          stiffness: 100,
        });
      `,
    },
    // Only damping
    {
      code: `
        const value = withSpring(100, {
          damping: 10,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass, stiffness' }
      }],
      output: `
        const value = withSpring(100, {
          damping: 10,
          mass: 1,
          stiffness: 100,
        });
      `,
    },
    // Only stiffness
    {
      code: `
        const value = withSpring(100, {
          stiffness: 100,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass, damping' }
      }],
      output: `
        const value = withSpring(100, {
          stiffness: 100,
          mass: 1,
          damping: 10,
        });
      `,
    },
    // Mass and damping, missing stiffness
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
          damping: 10,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'stiffness' }
      }],
      output: `
        const value = withSpring(100, {
          mass: 1,
          damping: 10,
          stiffness: 100,
        });
      `,
    },
    // Mass and stiffness, missing damping
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
          stiffness: 100,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'damping' }
      }],
      output: `
        const value = withSpring(100, {
          mass: 1,
          stiffness: 100,
          damping: 10,
        });
      `,
    },
    // Damping and stiffness, missing mass
    {
      code: `
        const value = withSpring(100, {
          damping: 10,
          stiffness: 100,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass' }
      }],
      output: `
        const value = withSpring(100, {
          damping: 10,
          stiffness: 100,
          mass: 1,
        });
      `,
    },
    // Partial params with other options
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
          overshootClamping: true,
        });
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'damping, stiffness' }
      }],
      output: `
        const value = withSpring(100, {
          mass: 1,
          overshootClamping: true,
          damping: 10,
          stiffness: 100,
        });
      `,
    },
  ],
});
