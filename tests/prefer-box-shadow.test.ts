import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import * as tsParser from '@typescript-eslint/parser';
import rule from '../src/rules/prefer-box-shadow';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

ruleTester.run('prefer-box-shadow', rule, {
  valid: [
    // Using boxShadow
    {
      code: `
        const styles = {
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
        };
      `,
    },
    // No shadow properties at all
    {
      code: `
        const styles = {
          padding: 10,
          margin: 5
        };
      `,
    },
    // Only shadowRadius without shadowColor
    {
      code: `
        const styles = {
          shadowRadius: 10
        };
      `,
    },
  ],
  invalid: [
    // Using shadowColor
    {
      code: `
        const styles = {
          shadowColor: '#000'
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
    },
    // Using shadowColor with other shadow properties
    {
      code: `
        const styles = {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
    },
    // Using shadowColor with some shadow properties
    {
      code: `
        const styles = {
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowRadius: 10
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
    },
  ],
});
