# eslint-plugin-refined

An ESLint plugin for refined React Native styles.

## Features

This plugin provides rules to help you write better React Native styles:

- **border-radius-with-curve**: Enforces using `borderCurve: 'continuous'` when borderRadius properties are used
- **prefer-hairline-width**: Suggests using `StyleSheet.hairlineWidth` for border widths less than 1
- **prefer-box-shadow**: Suggests using `boxShadow` instead of individual shadow properties

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

Suggests using `StyleSheet.hairlineWidth` for border widths less than 1 to ensure consistent thin borders across devices.

#### Examples

**Bad:**
```jsx
const styles = StyleSheet.create({
  container: {
    borderWidth: 0.5,
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
```

### prefer-box-shadow

Suggests using `boxShadow` instead of individual shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) for better performance and simpler syntax.

#### Examples

**Bad:**
```jsx
const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
```

**Good:**
```jsx
const styles = StyleSheet.create({
  container: {
    boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
});
```

## Configuration

### Recommended Config

Enables all rules with warning level:

```js
rules: {
  'refined/border-radius-with-curve': 'warn',
  'refined/prefer-hairline-width': 'warn',
  'refined/prefer-box-shadow': 'warn',
}
```

### Strict Config

Enables all rules with error level:

```js
rules: {
  'refined/border-radius-with-curve': 'error',
  'refined/prefer-hairline-width': 'error',
  'refined/prefer-box-shadow': 'error',
}
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
