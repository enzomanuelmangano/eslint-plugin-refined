import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import * as tsParser from '@typescript-eslint/parser';
import rule from '../src/rules/avoid-touchable-opacity';

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

ruleTester.run('avoid-touchable-opacity', rule, {
  valid: [
    // Using Pressable
    {
      code: `
        <Pressable onPress={handlePress}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Using TouchableWithoutFeedback
    {
      code: `
        <TouchableWithoutFeedback onPress={handlePress}>
          <View>
            <Text>Press me</Text>
          </View>
        </TouchableWithoutFeedback>
      `,
    },
    // Using custom component
    {
      code: `
        <Button onPress={handlePress}>
          <Text>Press me</Text>
        </Button>
      `,
    },
    // Using View with gesture handler
    {
      code: `
        <View onPress={handlePress}>
          <Text>Press me</Text>
        </View>
      `,
    },
  ],
  invalid: [
    // Using TouchableOpacity
    {
      code: `
        <TouchableOpacity onPress={handlePress}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
      errors: [
        {
          messageId: 'avoidTouchableOpacity',
          line: 2,
          column: 10,
        },
      ],
    },
    // Using TouchableOpacity with activeOpacity
    {
      code: `
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View>
            <Text>Press me</Text>
          </View>
        </TouchableOpacity>
      `,
      errors: [{ messageId: 'avoidTouchableOpacity' }],
    },
    // Using TouchableOpacity with style
    {
      code: `
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
      errors: [{ messageId: 'avoidTouchableOpacity' }],
    },
    // Self-closing TouchableOpacity
    {
      code: `
        <TouchableOpacity onPress={handlePress} />
      `,
      errors: [{ messageId: 'avoidTouchableOpacity' }],
    },
  ],
});
