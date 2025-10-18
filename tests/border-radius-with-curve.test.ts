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
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('border-radius-with-curve', rule, {
  valid: [
    // Has both borderRadius and borderCurve in StyleSheet.create
    {
      code: `
        const styles = StyleSheet.create({
          container: {
            borderRadius: 10,
            borderCurve: 'continuous'
          }
        });
      `,
    },
    // Has both borderRadius and borderCurve in inline style
    {
      code: `
        <View style={{ borderRadius: 10, borderCurve: 'continuous' }} />
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
        const styles = StyleSheet.create({
          container: {
            borderTopLeftRadius: 10,
            borderCurve: 'continuous'
          }
        });
      `,
    },
    // Circular border radius (>= 9999) - no borderCurve needed
    {
      code: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 9999,
            width: 50,
            height: 50
          }
        });
      `,
    },
    // Circular border radius (half of width) - no borderCurve needed
    {
      code: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 25,
            width: 50,
            height: 50
          }
        });
      `,
    },
    // Circular border radius (half of height) - no borderCurve needed
    {
      code: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 30,
            width: 50,
            height: 60
          }
        });
      `,
    },
    // Inside useAnimatedStyle - should be ignored
    {
      code: `
        const animatedStyle = useAnimatedStyle(() => {
          return {
            borderRadius: 10,
            transform: [{ scale: 1 }]
          };
        });
      `,
    },
    // Inside useAnimatedStyle with interpolate - should be ignored
    {
      code: `
        const rActionTrayStyle = useAnimatedStyle(() => {
          const borderRadius = interpolate(
            translateY.value,
            [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
            [25, 5],
            Extrapolation.CLAMP,
          );

          return {
            borderRadius,
            transform: [{ translateY: translateY.value }],
          };
        });
      `,
    },
    // Inside useDerivedValue - should be ignored
    {
      code: `
        const derivedStyle = useDerivedValue(() => {
          return {
            borderRadius: 10,
          };
        });
      `,
    },
    // Function parameter - should be ignored
    {
      code: `
        return drawSquirclePath({
          borderSmoothing: 1,
          borderRadius: 20,
          width: size,
          height: size,
          borderCurve: 'continuous',
        });
      `,
    },
    // Function return value - should be ignored
    {
      code: `
        export const getPathParams = () => {
          return {
            borderRadius: 20,
            width: 100,
            height: 100,
            borderCurve: 'continuous',
          };
        };
      `,
    },
    // Plain object literal not in StyleSheet or JSX - should be ignored
    {
      code: `
        const config = {
          borderRadius: 10,
          width: 100,
        };
      `,
    },
  ],
  invalid: [
    // Circular border radius WITH borderCurve in StyleSheet.create - should be reported as unnecessary
    {
      code: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 9999,
            borderCurve: 'continuous',
            width: 50,
            height: 50
          }
        });
      `,
      errors: [{ messageId: 'unnecessaryBorderCurve' }],
      output: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 9999,
            width: 50,
            height: 50
          }
        });
      `,
    },
    // Circular border radius (half of width) WITH borderCurve - unnecessary
    {
      code: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 25,
            borderCurve: 'continuous',
            width: 50,
            height: 50
          }
        });
      `,
      errors: [{ messageId: 'unnecessaryBorderCurve' }],
      output: `
        const styles = StyleSheet.create({
          circle: {
            borderRadius: 25,
            width: 50,
            height: 50
          }
        });
      `,
    },
    // Has borderRadius but no borderCurve in StyleSheet.create
    {
      code: `
        const styles = StyleSheet.create({
          container: {
            borderRadius: 10
          }
        });
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        const styles = StyleSheet.create({
          container: {
            borderRadius: 10,
            borderCurve: 'continuous'
          }
        });
      `,
    },
    // Has borderRadius but no borderCurve in inline JSX style
    {
      code: `
        <View style={{ borderRadius: 10 }} />
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        <View style={{ borderRadius: 10,
        borderCurve: 'continuous' }} />
      `,
    },
    // Has borderTopLeftRadius but no borderCurve in StyleSheet.create
    {
      code: `
        const styles = StyleSheet.create({
          container: {
            borderTopLeftRadius: 10,
            backgroundColor: 'red'
          }
        });
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        const styles = StyleSheet.create({
          container: {
            borderTopLeftRadius: 10,
            backgroundColor: 'red',
            borderCurve: 'continuous'
          }
        });
      `,
    },
    // Has multiple border radius properties but no borderCurve
    {
      code: `
        const styles = StyleSheet.create({
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10
          }
        });
      `,
      errors: [{ messageId: 'missingBorderCurve' }],
      output: `
        const styles = StyleSheet.create({
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            borderCurve: 'continuous'
          }
        });
      `,
    },
  ],
});
