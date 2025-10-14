# eslint-plugin-refined

An ESLint plugin for refined React Native styles.

## Features

This plugin provides rules to help you write better React Native styles:

### Enabled by Default (in recommended/strict configs)

- **border-radius-with-curve**: Enforces using `borderCurve: 'continuous'` when borderRadius properties are used
- **prefer-hairline-width**: Suggests using `StyleSheet.hairlineWidth` for border widths less than a threshold (configurable)
- **prefer-box-shadow**: Suggests using `boxShadow` instead of individual shadow properties

### Opt-in Rules (must be explicitly enabled)

- **spring-config-consistency**: Enforces consistent spring physics parameters in `withSpring` calls
- **avoid-touchable-opacity**: Discourages usage of `TouchableOpacity` component

## Installation

```bash
npm install --save-dev eslint-plugin-refined
# or
yarn add -D eslint-plugin-refined
# or
bun add -D eslint-plugin-refined
```

## Usage

### Flat Config (ESLint 9+)

```js
import refined from 'eslint-plugin-refined';

export default [
  {
    plugins: {
      refined,
    },
    rules: {
      ...refined.configs.recommended.rules,
    },
  },
];
```

### Using Preset Configs

```js
import refined from 'eslint-plugin-refined';

export default [
  {
    plugins: {
      refined,
    },
    // Use recommended config (warnings)
    rules: refined.configs.recommended.rules,

    // Or use strict config (errors)
    // rules: refined.configs.strict.rules,
  },
];
```

## Rules

### border-radius-with-curve

Enforces using `borderCurve: 'continuous'` when borderRadius properties are used for better visual quality on iOS.

#### Examples

**Bad:**
```jsx
const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
  },
});
```

**Good:**
```jsx
const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderCurve: 'continuous',
  },
});
```

### prefer-hairline-width

Suggests using `StyleSheet.hairlineWidth` for border widths less than or equal to a configurable threshold (default: 0.3) to ensure consistent thin borders across devices.

#### Options

- `threshold` (number, default: 0.3): The maximum border width value that should trigger this rule. Values must be between 0 and 1.

#### Examples

**Bad:**
```jsx
const styles = StyleSheet.create({
  container: {
    borderWidth: 0.3, // <= default threshold
  },
});
```

**Good:**
```jsx
const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});

// Or use a value above the threshold
const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5, // > default threshold, won't trigger
  },
});
```

#### Configuration

```js
// Use default threshold of 0.3
rules: {
  'refined/prefer-hairline-width': 'warn',
}

// Custom threshold: flag all values <= 0.5
rules: {
  'refined/prefer-hairline-width': ['warn', { threshold: 0.5 }],
}

// Strict mode: flag all values < 1
rules: {
  'refined/prefer-hairline-width': ['warn', { threshold: 1 }],
}
```

### prefer-box-shadow

Suggests using `boxShadow` instead of individual shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation`) for better performance and simpler syntax. The rule automatically converts shadow properties to the CSS-like `boxShadow` format and removes `elevation` (Android-specific) as `boxShadow` now provides cross-platform shadow support.

#### Examples

**Bad:**
```jsx
const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
```

**Good:**
```jsx
const styles = StyleSheet.create({
  container: {
    boxShadow: '0 2 3.84 rgba(0, 0, 0, 0.25)',
  },
});
```

### spring-config-consistency

Enforces that `withSpring` calls either have all three spring physics parameters (`mass`, `damping`, `stiffness`) or none of them. This ensures consistent spring animations and prevents incomplete configurations. The rule ignores `withSpring` calls that use `duration` or `dampingRatio` as these are alternative spring configuration modes.

#### Examples

**Bad:**
```jsx
// Only mass specified - missing damping and stiffness
const value = withSpring(100, {
  mass: 1,
});

// Only damping and stiffness - missing mass
const value = withSpring(100, {
  damping: 10,
  stiffness: 100,
});
```

**Good:**
```jsx
// All three spring params specified
const value = withSpring(100, {
  mass: 1,
  damping: 10,
  stiffness: 100,
});

// No spring physics params (uses defaults)
const value = withSpring(100, {
  overshootClamping: true,
});

// Using alternative spring config mode (ignored by rule)
const value = withSpring(100, {
  duration: 1000,
});

// Using dampingRatio mode (ignored by rule)
const value = withSpring(100, {
  dampingRatio: 0.5,
});
```

**Note:** The rule provides auto-fix that adds missing parameters with sensible defaults (`mass: 1`, `damping: 10`, `stiffness: 100`).

**Important:** This rule is opt-in and not included in the recommended or strict configs. Enable it explicitly if you want to enforce spring config consistency:

```js
rules: {
  'refined/spring-config-consistency': 'warn',
}
```

### avoid-touchable-opacity

Discourages usage of `TouchableOpacity` component in favor of more performant alternatives.

#### Examples

**Bad:**
```jsx
<TouchableOpacity onPress={handlePress}>
  <Text>Press me</Text>
</TouchableOpacity>
```

**Good:**
```jsx
<Pressable onPress={handlePress}>
  <Text>Press me</Text>
</Pressable>

// Or use any other alternative
<TouchableWithoutFeedback onPress={handlePress}>
  <View>
    <Text>Press me</Text>
  </View>
</TouchableWithoutFeedback>
```

**Important:** This rule is opt-in and not included in the recommended or strict configs. Enable it explicitly if you want to discourage TouchableOpacity:

```js
rules: {
  'refined/avoid-touchable-opacity': 'warn',
}
```

## Configuration

### Recommended Config

Enables core rules with warning level:

```js
rules: {
  'refined/border-radius-with-curve': 'warn',
  'refined/prefer-hairline-width': 'warn',
  'refined/prefer-box-shadow': 'warn',
}
```

### Strict Config

Enables core rules with error level:

```js
rules: {
  'refined/border-radius-with-curve': 'error',
  'refined/prefer-hairline-width': 'error',
  'refined/prefer-box-shadow': 'error',
}
```

### Custom Configuration

You can enable opt-in rules and configure rule options:

```js
export default [
  {
    plugins: {
      refined,
    },
    rules: {
      // Use recommended rules
      ...refined.configs.recommended.rules,

      // Customize prefer-hairline-width threshold
      'refined/prefer-hairline-width': ['warn', { threshold: 0.5 }],

      // Enable opt-in rules
      'refined/spring-config-consistency': 'warn',
      'refined/avoid-touchable-opacity': 'warn',
    },
  },
];
```

## Example Project

Check out the `example/` directory for a working Expo project that demonstrates all the rules in action.

```bash
cd example
npm install
npm run lint        # See the warnings
npm run lint:fix    # Auto-fix violations
npm start          # Run the app
```

## Development

### Install Dependencies

```bash
bun install
```

### Run Tests

```bash
bun test
```

### Build

```bash
bun run build
```

## License

MIT
