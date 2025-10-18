import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import * as tsParser from '@typescript-eslint/parser';
import rule from '../src/rules/require-hitslop-small-touchables';

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

ruleTester.run('require-hitslop-small-touchables', rule, {
  valid: [
    // No press handlers - not a touchable
    {
      code: `
        <View style={{ width: 30, height: 30 }}>
          <Text>Not touchable</Text>
        </View>
      `,
    },
    // Large enough size (>= 40)
    {
      code: `
        <Pressable onPress={handlePress} style={{ width: 40, height: 40 }}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Above threshold
    {
      code: `
        <Pressable onPress={handlePress} style={{ width: 50, height: 50 }}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Already has hitSlop
    {
      code: `
        <Pressable onPress={handlePress} style={{ width: 30, height: 30 }} hitSlop={10}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Both dimensions large enough
    {
      code: `
        <TouchableOpacity onPress={handlePress} style={{ width: 50, height: 50 }}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
    },
    // No style prop
    {
      code: `
        <Pressable onPress={handlePress}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // StyleSheet with large size
    {
      code: `
        const styles = StyleSheet.create({
          button: { width: 50, height: 50 }
        });
        <Pressable onPress={handlePress} style={styles.button}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Custom threshold - 25 is valid with threshold of 20
    {
      code: `
        <Pressable onPress={handlePress} style={{ width: 25, height: 25 }}>
          <Text>Press me</Text>
        </Pressable>
      `,
      options: [{ minSize: 20 }],
    },
  ],
  invalid: [
    // Small inline style
    {
      code: `
        <Pressable onPress={handlePress} style={{ width: 30, height: 30 }}>
          <Text>Press me</Text>
        </Pressable>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <Pressable onPress={handlePress} style={{ width: 30, height: 30 }} hitSlop={5}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Small width only
    {
      code: `
        <TouchableOpacity onPress={handlePress} style={{ width: 30 }}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <TouchableOpacity onPress={handlePress} style={{ width: 30 }} hitSlop={5}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
    },
    // Small height only
    {
      code: `
        <TouchableOpacity onPress={handlePress} style={{ height: 30 }}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <TouchableOpacity onPress={handlePress} style={{ height: 30 }} hitSlop={5}>
          <Text>Press me</Text>
        </TouchableOpacity>
      `,
    },
    // StyleSheet reference with small size
    {
      code: `
        const styles = StyleSheet.create({
          icon: { width: 24, height: 24 }
        });
        <Pressable onPress={handlePress} style={styles.icon}>
          <Icon name="close" />
        </Pressable>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        const styles = StyleSheet.create({
          icon: { width: 24, height: 24 }
        });
        <Pressable onPress={handlePress} style={styles.icon} hitSlop={8}>
          <Icon name="close" />
        </Pressable>
      `,
    },
    // Custom component with onPress
    {
      code: `
        <IconButton onPress={handlePress} style={{ width: 32, height: 32 }}>
          <Icon name="settings" />
        </IconButton>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <IconButton onPress={handlePress} style={{ width: 32, height: 32 }} hitSlop={4}>
          <Icon name="settings" />
        </IconButton>
      `,
    },
    // View used as touchable
    {
      code: `
        <View onPress={handlePress} style={{ width: 20, height: 20 }}>
          <Icon name="x" />
        </View>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <View onPress={handlePress} style={{ width: 20, height: 20 }} hitSlop={10}>
          <Icon name="x" />
        </View>
      `,
    },
    // onLongPress handler
    {
      code: `
        <Pressable onLongPress={handleLongPress} style={{ width: 30, height: 30 }}>
          <Text>Long press me</Text>
        </Pressable>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <Pressable onLongPress={handleLongPress} style={{ width: 30, height: 30 }} hitSlop={5}>
          <Text>Long press me</Text>
        </Pressable>
      `,
    },
    // onTouchStart handler
    {
      code: `
        <View onTouchStart={handleTouch} style={{ width: 25, height: 25 }}>
          <Text>Touch me</Text>
        </View>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <View onTouchStart={handleTouch} style={{ width: 25, height: 25 }} hitSlop={8}>
          <Text>Touch me</Text>
        </View>
      `,
    },
    // Style array with small size
    {
      code: `
        const styles = StyleSheet.create({
          base: { borderRadius: 8 },
          small: { width: 30, height: 30 }
        });
        <Pressable onPress={handlePress} style={[styles.base, styles.small]}>
          <Icon name="heart" />
        </Pressable>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        const styles = StyleSheet.create({
          base: { borderRadius: 8 },
          small: { width: 30, height: 30 }
        });
        <Pressable onPress={handlePress} style={[styles.base, styles.small]} hitSlop={5}>
          <Icon name="heart" />
        </Pressable>
      `,
    },
    // Style array with inline override
    {
      code: `
        const styles = StyleSheet.create({
          base: { width: 50, height: 50 }
        });
        <Pressable onPress={handlePress} style={[styles.base, { width: 20, height: 20 }]}>
          <Icon name="close" />
        </Pressable>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        const styles = StyleSheet.create({
          base: { width: 50, height: 50 }
        });
        <Pressable onPress={handlePress} style={[styles.base, { width: 20, height: 20 }]} hitSlop={10}>
          <Icon name="close" />
        </Pressable>
      `,
    },
    // Custom threshold
    {
      code: `
        <Pressable onPress={handlePress} style={{ width: 40, height: 40 }}>
          <Text>Press me</Text>
        </Pressable>
      `,
      options: [{ minSize: 48 }],
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        <Pressable onPress={handlePress} style={{ width: 40, height: 40 }} hitSlop={4}>
          <Text>Press me</Text>
        </Pressable>
      `,
    },
    // Named stylesheet (not 'styles')
    {
      code: `
        const buttonStyles = StyleSheet.create({
          small: { width: 28, height: 28 }
        });
        <Pressable onPress={handlePress} style={buttonStyles.small}>
          <Icon name="menu" />
        </Pressable>
      `,
      errors: [{ messageId: 'requireHitSlop' }],
      output: `
        const buttonStyles = StyleSheet.create({
          small: { width: 28, height: 28 }
        });
        <Pressable onPress={handlePress} style={buttonStyles.small} hitSlop={6}>
          <Icon name="menu" />
        </Pressable>
      `,
    },
  ],
});
