import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import * as tsParser from '@typescript-eslint/parser';
import rule from '../src/rules/prefer-hairline-width';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

ruleTester.run('prefer-hairline-width', rule, {
  valid: [
    // Using StyleSheet.hairlineWidth
    {
      code: `
        const styles = {
          borderWidth: StyleSheet.hairlineWidth
        };
      `,
    },
    // Using a value >= 1
    {
      code: `
        const styles = {
          borderWidth: 1
        };
      `,
    },
    // Using a value > 1
    {
      code: `
        const styles = {
          borderWidth: 2
        };
      `,
    },
    // No border width at all
    {
      code: `
        const styles = {
          padding: 10
        };
      `,
    },
    // Using 0.5 (above default threshold of 0.3)
    {
      code: `
        const styles = {
          borderWidth: 0.5
        };
      `,
    },
    // Using 0.4 (above default threshold of 0.3)
    {
      code: `
        const styles = {
          borderWidth: 0.4
        };
      `,
    },
    // Using 0.2 with custom threshold of 0.1 (above threshold, should be valid)
    {
      code: `
        const styles = {
          borderWidth: 0.2
        };
      `,
      options: [{ threshold: 0.1 }],
    },
  ],
  invalid: [
    // Using 0.3 (exactly at threshold)
    {
      code: `
        const styles = {
          borderWidth: 0.3
        };
      `,
      errors: [{ messageId: 'useHairlineWidth' }],
      output: `
        const styles = {
          borderWidth: StyleSheet.hairlineWidth
        };
      `,
    },
    // Using 0.25 for borderTopWidth
    {
      code: `
        const styles = {
          borderTopWidth: 0.25
        };
      `,
      errors: [{ messageId: 'useHairlineWidth' }],
      output: `
        const styles = {
          borderTopWidth: StyleSheet.hairlineWidth
        };
      `,
    },
    // Using 0.1 for borderBottomWidth
    {
      code: `
        const styles = {
          borderBottomWidth: 0.1
        };
      `,
      errors: [{ messageId: 'useHairlineWidth' }],
      output: `
        const styles = {
          borderBottomWidth: StyleSheet.hairlineWidth
        };
      `,
    },
    // Using 0.5 with custom threshold of 1
    {
      code: `
        const styles = {
          borderWidth: 0.5
        };
      `,
      options: [{ threshold: 1 }],
      errors: [{ messageId: 'useHairlineWidth' }],
      output: `
        const styles = {
          borderWidth: StyleSheet.hairlineWidth
        };
      `,
    },
    // Using 0.5 with custom threshold of 0.5
    {
      code: `
        const styles = {
          borderWidth: 0.5
        };
      `,
      options: [{ threshold: 0.5 }],
      errors: [{ messageId: 'useHairlineWidth' }],
      output: `
        const styles = {
          borderWidth: StyleSheet.hairlineWidth
        };
      `,
    },
    // Using 0.05 with custom threshold of 0.1
    {
      code: `
        const styles = {
          borderWidth: 0.05
        };
      `,
      options: [{ threshold: 0.1 }],
      errors: [{ messageId: 'useHairlineWidth' }],
      output: `
        const styles = {
          borderWidth: StyleSheet.hairlineWidth
        };
      `,
    },
  ],
});
