import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import * as tsParser from '@typescript-eslint/parser';
import rule from '../src/rules/border-radius-with-curve';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

ruleTester.run('border-radius-with-curve', rule, {
  valid: [
    // Has both borderRadius and borderCurve
    {
      code: `
        const styles = {
          borderRadius: 10,
          borderCurve: 'continuous'
        };
      `,
    },
    // No borderRadius at all
    {
      code: `
        const styles = {
          padding: 10,
          margin: 5
        };
      `,
    },
    // Has borderTopLeftRadius and borderCurve
    {
      code: `
        const styles = {
          borderTopLeftRadius: 10,
          borderCurve: 'continuous'
        };
      `,
    },
    // Circular border radius (>= 9999) - no borderCurve needed
    {
      code: `
        const styles = {
          borderRadius: 9999,
          width: 50,
          height: 50
        };
      `,
    },
    // Circular border radius (half of width) - no borderCurve needed
    {
      code: `
        const styles = {
          borderRadius: 25,
          width: 50,
          height: 50
        };
      `,
    },
    // Circular border radius (half of height) - no borderCurve needed
    {
      code: `
        const styles = {
          borderRadius: 30,
          width: 50,
          height: 60
        };
      `,
    },
  ],
  invalid: [
    // Circular border radius WITH borderCurve - should be reported as unnecessary
    {
      code: `
        const styles = {
          borderRadius: 9999,
          borderCurve: 'continuous',
          width: 50,
          height: 50
        };
      `,
      errors: [{ messageId: 'unnecessaryBorderCurve' }],
      output: `
        const styles = {
          borderRadius: 9999,
          width: 50,
          height: 50
        };
      `,
    },
    // Circular border radius (half of width) WITH borderCurve - unnecessary
    {
      code: `
        const styles = {
          borderRadius: 25,
          borderCurve: 'continuous',
          width: 50,
          height: 50
        };
      `,
      errors: [{ messageId: 'unnecessaryBorderCurve' }],
      output: `
        const styles = {
          borderRadius: 25,
          width: 50,
          height: 50
        };
      `,
    },
    // Has borderRadius but no borderCurve
    {
      code: `
        const styles = {
          borderRadius: 10
        };
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        const styles = {
          borderRadius: 10,
          borderCurve: 'continuous'
        };
      `,
    },
    // Has borderTopLeftRadius but no borderCurve
    {
      code: `
        const styles = {
          borderTopLeftRadius: 10,
          backgroundColor: 'red'
        };
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        const styles = {
          borderTopLeftRadius: 10,
          backgroundColor: 'red',
          borderCurve: 'continuous'
        };
      `,
    },
    // Has multiple border radius properties but no borderCurve
    {
      code: `
        const styles = {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10
        };
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        const styles = {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          borderCurve: 'continuous'
        };
      `,
    },
  ],
});
