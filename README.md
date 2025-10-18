# eslint-plugin-refined

An ESLint plugin for refined React Native styles.

## Features

This plugin provides rules to help you write better React Native styles:

### Enabled by Default (in recommended/strict configs)

- **border-radius-with-curve**: Enforces using `borderCurve: 'continuous'` when borderRadius properties are used
- **prefer-hairline-width**: Suggests using `StyleSheet.hairlineWidth` for border widths less than a threshold (configurable)
- **prefer-box-shadow**: Suggests using `boxShadow` instead of individual shadow properties
- **require-hitslop-small-touchables**: Requires hitSlop on small touchable elements for better accessibility
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

### [border-radius-with-curve](./docs/rules/border-radius-with-curve.md)

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

### [prefer-hairline-width](./docs/rules/prefer-hairline-width.md)

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

### [prefer-box-shadow](./docs/rules/prefer-box-shadow.md)

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
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
});
```

### [spring-config-consistency](./docs/rules/spring-config-consistency.md)

Enforces that spring animations either have all three spring physics parameters (`mass`, `damping`, `stiffness`) or none of them. This ensures consistent spring animations and prevents incomplete configurations.

This rule works with:
- `withSpring` calls (ignores calls using `duration` or `dampingRatio` as these are alternative modes)
- Transition `springify()` chains (e.g., `LinearTransition.springify().mass(1).damping(30).stiffness(250)`)

#### Options

- `reanimatedVersion` (string, default: 'v4'): Specifies which React Native Reanimated version defaults to use in auto-fix:
  - `'v4'`: Uses Reanimated v4 defaults (mass: 4, damping: 120, stiffness: 900)
  - `'v3'`: Uses Reanimated v3 defaults (mass: 4, damping: 10, stiffness: 100)

#### Examples

**Bad:**
```jsx
// withSpring: Only mass specified - missing damping and stiffness
const value = withSpring(100, {
  mass: 1,
});

// withSpring: Only damping and stiffness - missing mass
const value = withSpring(100, {
  damping: 10,
  stiffness: 100,
});

// LinearTransition: Only mass - missing damping and stiffness
const Layout = LinearTransition.springify().mass(1);

// LinearTransition: Missing stiffness
const Layout = LinearTransition.springify().mass(1).damping(30);
```

**Good:**
```jsx
// withSpring: All three spring params specified
const value = withSpring(100, {
  mass: 1,
  damping: 10,
  stiffness: 100,
});

// withSpring: No spring physics params (uses defaults)
const value = withSpring(100, {
  overshootClamping: true,
});

// withSpring: Using alternative spring config mode (ignored by rule)
const value = withSpring(100, {
  duration: 1000,
});

// withSpring: Using dampingRatio mode (ignored by rule)
const value = withSpring(100, {
  dampingRatio: 0.5,
});

// LinearTransition: All three spring params specified
const Layout = LinearTransition.springify().mass(1).damping(30).stiffness(250);

// LinearTransition: No spring params (uses defaults)
const Layout = LinearTransition.springify();

// FadingTransition: All three spring params specified
const Layout = FadingTransition.springify().mass(2).damping(20).stiffness(150);
```

#### Configuration

```js
// Use default (v4) spring defaults
rules: {
  'refined/spring-config-consistency': 'warn',
}

// Use Reanimated v3 defaults
rules: {
  'refined/spring-config-consistency': ['warn', { reanimatedVersion: 'v3' }],
}

// Explicitly use v4 defaults
rules: {
  'refined/spring-config-consistency': ['warn', { reanimatedVersion: 'v4' }],
}
```

**Note:** The rule provides auto-fix that adds missing parameters with version-specific defaults:
- **Reanimated v4** (default): `mass: 4`, `damping: 120`, `stiffness: 900`
- **Reanimated v3**: `mass: 4`, `damping: 10`, `stiffness: 100`

### [avoid-touchable-opacity](./docs/rules/avoid-touchable-opacity.md)

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

### [require-hitslop-small-touchables](./docs/rules/require-hitslop-small-touchables.md)

Requires `hitSlop` prop on touchable elements that are smaller than a configurable threshold (default: 40pt) to improve tap target size and accessibility. This rule detects touchable elements by checking for press handler props (`onPress`, `onLongPress`, etc.) rather than specific component names, making it work with any custom touchable component.

#### Options

- `minSize` (number, default: 40): The minimum recommended size for touchable elements in points. Elements smaller than this should have `hitSlop`.

#### Examples

**Bad:**
```jsx
// Small touchable without hitSlop
<Pressable onPress={handlePress} style={{ width: 30, height: 30 }}>
  <Icon name="close" />
</Pressable>

// Custom component with small size
<IconButton onPress={handlePress} style={{ width: 24, height: 24 }}>
  <Icon name="settings" />
</IconButton>

// StyleSheet reference
const styles = StyleSheet.create({
  icon: { width: 32, height: 32 }
});
<TouchableOpacity onPress={handlePress} style={styles.icon}>
  <Icon name="menu" />
</TouchableOpacity>
```

**Good:**
```jsx
// Small touchable with hitSlop
<Pressable
  onPress={handlePress}
  style={{ width: 30, height: 30 }}
  hitSlop={10}
>
  <Icon name="close" />
</Pressable>

// Large enough touchable (>= 40pt)
<Pressable onPress={handlePress} style={{ width: 44, height: 44 }}>
  <Icon name="settings" />
</Pressable>

// Not a touchable (no press handlers)
<View style={{ width: 20, height: 20 }}>
  <Icon name="info" />
</View>
```

#### Configuration

```js
// Use default threshold of 40pt (automatically enabled in recommended config)
rules: {
  'refined/require-hitslop-small-touchables': 'warn',
}

// Stricter: iOS/Android minimum (44pt)
rules: {
  'refined/require-hitslop-small-touchables': ['warn', { minSize: 44 }],
}

// More lenient: 30pt
rules: {
  'refined/require-hitslop-small-touchables': ['warn', { minSize: 30 }],
}
```

**Note:** This rule checks both inline styles and `StyleSheet.create` references. It detects touchable elements by looking for press handler props, so it works with any component (Pressable, TouchableOpacity, custom components, even View).

## Configuration

### Recommended Config

Enables all rules with warning level:

```js
rules: {
  'refined/border-radius-with-curve': 'warn',
  'refined/prefer-hairline-width': 'warn',
  'refined/prefer-box-shadow': 'warn',
  'refined/require-hitslop-small-touchables': 'warn',
  'refined/spring-config-consistency': 'warn',
  'refined/avoid-touchable-opacity': 'warn',
}
```

### Strict Config

Enables all rules with error level:

```js
rules: {
  'refined/border-radius-with-curve': 'error',
  'refined/prefer-hairline-width': 'error',
  'refined/prefer-box-shadow': 'error',
  'refined/require-hitslop-small-touchables': 'error',
  'refined/spring-config-consistency': 'error',
  'refined/avoid-touchable-opacity': 'error',
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

      // Customize rule options
      'refined/prefer-hairline-width': ['warn', { threshold: 0.5 }],
      'refined/require-hitslop-small-touchables': ['warn', { minSize: 44 }],
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
