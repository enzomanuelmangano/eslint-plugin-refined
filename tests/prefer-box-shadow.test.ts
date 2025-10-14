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
          shadowColor: '#000',
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          boxShadow: '0 0 0 #000',
        };
      `,
    },
    // Using shadowColor with other shadow properties
    {
      code: `
        const styles = {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          boxShadow: '0 2 3.84 rgba(0, 0, 0, 0.25)',
        };
      `,
    },
    // Using shadowColor with some shadow properties
    {
      code: `
        const styles = {
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowRadius: 10,
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          boxShadow: '0 0 10 rgba(0, 0, 0, 0.1)',
        };
      `,
    },
    // Using shadowColor with all properties including elevation (elevation also removed)
    {
      code: `
        const styles = {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.23,
          shadowRadius: 6,
          elevation: 5,
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          boxShadow: '0 3 6 rgba(0, 0, 0, 0.23)',
        };
      `,
    },
    // Using shadowColor with other non-shadow properties
    {
      code: `
        const styles = {
          padding: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          margin: 5
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          padding: 10,
          boxShadow: '0 2 3.84 rgba(0, 0, 0, 0.25)',
          margin: 5
        };
      `,
    },
    // Named color 'black' with opacity
    {
      code: `
        const styles = {
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          boxShadow: '0 0 10 rgba(0, 0, 0, 0.1)',
        };
      `,
    },
    // Named color 'white' with opacity
    {
      code: `
        const styles = {
          shadowColor: 'white',
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          boxShadow: '2 4 8 rgba(255, 255, 255, 0.5)',
        };
      `,
    },
    // Shadow properties mixed with non-shadow properties (should preserve non-shadow)
    {
      code: `
        const styles = {
          elevation: 5,
          flexDirection: 'row',
          height: 85,
          justifyContent: 'space-between',
          margin: 10,
          paddingLeft: 15,
          paddingRight: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        };
      `,
      errors: [{ messageId: 'preferBoxShadow' }],
      output: `
        const styles = {
          flexDirection: 'row',
          height: 85,
          justifyContent: 'space-between',
          margin: 10,
          paddingLeft: 15,
          paddingRight: 20,
          boxShadow: '0 5 10 rgba(0, 0, 0, 0.2)',
        };
      `,
    },
  ],
});
