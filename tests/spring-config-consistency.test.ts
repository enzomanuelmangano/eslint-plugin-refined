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
    // LinearTransition with all three params
    {
      code: `
        const Layout = LinearTransition.springify().mass(1).damping(30).stiffness(250);
      `,
    },
    // FadingTransition with all three params
    {
      code: `
        const Layout = FadingTransition.springify().mass(2).damping(20).stiffness(150);
      `,
    },
    // LinearTransition with no spring params (just springify)
    {
      code: `
        const Layout = LinearTransition.springify();
      `,
    },
    // LinearTransition with all three params in different order
    {
      code: `
        const Layout = LinearTransition.springify().stiffness(250).mass(1).damping(30);
      `,
    },
  ],
  invalid: [
    // Only mass (uses v4 defaults)
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
          damping: 120,
          stiffness: 900,
        });
      `,
    },
    // Only damping (uses v4 defaults)
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
          mass: 4,
          stiffness: 900,
        });
      `,
    },
    // Only stiffness (uses v4 defaults)
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
          mass: 4,
          damping: 120,
        });
      `,
    },
    // Mass and damping, missing stiffness (uses v4 defaults)
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
          stiffness: 900,
        });
      `,
    },
    // Mass and stiffness, missing damping (uses v4 defaults)
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
          damping: 120,
        });
      `,
    },
    // Damping and stiffness, missing mass (uses v4 defaults)
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
          mass: 4,
        });
      `,
    },
    // Partial params with other options (uses v4 defaults)
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
          damping: 120,
          stiffness: 900,
        });
      `,
    },
    // Only mass with v3 option
    {
      code: `
        const value = withSpring(100, {
          mass: 1,
        });
      `,
      options: [{ reanimatedVersion: 'v3' }],
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
    // Only damping with v3 option
    {
      code: `
        const value = withSpring(100, {
          damping: 10,
        });
      `,
      options: [{ reanimatedVersion: 'v3' }],
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass, stiffness' }
      }],
      output: `
        const value = withSpring(100, {
          damping: 10,
          mass: 4,
          stiffness: 100,
        });
      `,
    },
    // Only stiffness with v3 option
    {
      code: `
        const value = withSpring(100, {
          stiffness: 200,
        });
      `,
      options: [{ reanimatedVersion: 'v3' }],
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass, damping' }
      }],
      output: `
        const value = withSpring(100, {
          stiffness: 200,
          mass: 4,
          damping: 10,
        });
      `,
    },
    // LinearTransition with only mass (uses v4 defaults)
    {
      code: `
        const Layout = LinearTransition.springify().mass(1);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'damping, stiffness' }
      }],
      output: `
        const Layout = LinearTransition.springify().mass(1).damping(120).stiffness(900);
      `,
    },
    // LinearTransition with only damping (uses v4 defaults)
    {
      code: `
        const Layout = LinearTransition.springify().damping(30);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass, stiffness' }
      }],
      output: `
        const Layout = LinearTransition.springify().damping(30).mass(4).stiffness(900);
      `,
    },
    // LinearTransition with only stiffness (uses v4 defaults)
    {
      code: `
        const Layout = LinearTransition.springify().stiffness(250);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass, damping' }
      }],
      output: `
        const Layout = LinearTransition.springify().stiffness(250).mass(4).damping(120);
      `,
    },
    // LinearTransition with mass and damping, missing stiffness (uses v4 defaults)
    {
      code: `
        const Layout = LinearTransition.springify().mass(1).damping(30);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'stiffness' }
      }],
      output: `
        const Layout = LinearTransition.springify().mass(1).damping(30).stiffness(900);
      `,
    },
    // LinearTransition with mass and stiffness, missing damping (uses v4 defaults)
    {
      code: `
        const Layout = LinearTransition.springify().mass(1).stiffness(250);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'damping' }
      }],
      output: `
        const Layout = LinearTransition.springify().mass(1).stiffness(250).damping(120);
      `,
    },
    // LinearTransition with damping and stiffness, missing mass (uses v4 defaults)
    {
      code: `
        const Layout = LinearTransition.springify().damping(30).stiffness(250);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'mass' }
      }],
      output: `
        const Layout = LinearTransition.springify().damping(30).stiffness(250).mass(4);
      `,
    },
    // LinearTransition with only mass (uses v3 option)
    {
      code: `
        const Layout = LinearTransition.springify().mass(1);
      `,
      options: [{ reanimatedVersion: 'v3' }],
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'damping, stiffness' }
      }],
      output: `
        const Layout = LinearTransition.springify().mass(1).damping(10).stiffness(100);
      `,
    },
    // FadingTransition with incomplete params
    {
      code: `
        const Layout = FadingTransition.springify().mass(2).damping(20);
      `,
      errors: [{
        messageId: 'incompleteSpringConfig',
        data: { missing: 'stiffness' }
      }],
      output: `
        const Layout = FadingTransition.springify().mass(2).damping(20).stiffness(900);
      `,
    },
  ],
});
