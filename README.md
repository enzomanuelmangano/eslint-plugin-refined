# eslint-plugin-refined

An ESLint plugin for refined React Native styles.

## Features

This plugin provides rules to help you write better React Native styles.

### Available Configurations

- **base**: Core style rules (border-radius, hairline-width, box-shadow, hitslop)
- **recommended**: All rules with warnings (includes spring-config, avoid-touchable-opacity)
- **strict**: All rules with errors

### Rules

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

Enforces using `borderCurve: 'continuous'` when borderRadius properties are used.

### [prefer-hairline-width](./docs/rules/prefer-hairline-width.md)

Suggests using `StyleSheet.hairlineWidth` for thin borders (configurable threshold, default: 0.3).

### [prefer-box-shadow](./docs/rules/prefer-box-shadow.md)

Suggests using `boxShadow` instead of individual shadow properties for better performance.

### [require-hitslop-small-touchables](./docs/rules/require-hitslop-small-touchables.md)

Requires `hitSlop` prop on small touchable elements (default: <40pt) for better accessibility.

### [spring-config-consistency](./docs/rules/spring-config-consistency.md)

Enforces complete spring physics parameters (`mass`, `damping`, `stiffness`) in animations.

### [avoid-touchable-opacity](./docs/rules/avoid-touchable-opacity.md)

Discourages usage of `TouchableOpacity` in favor of more performant alternatives.

## Configuration

This plugin provides three preset configurations:

### Base Config

Core style rules only (excludes `spring-config-consistency` and `avoid-touchable-opacity`):

```js
export default [
  {
    plugins: { refined },
    rules: refined.configs.base.rules,
  },
];
```

### Recommended Config (Default)

All rules enabled with warning level:

```js
export default [
  {
    plugins: { refined },
    rules: refined.configs.recommended.rules,
  },
];
```

### Strict Config

All rules enabled with error level:

```js
export default [
  {
    plugins: { refined },
    rules: refined.configs.strict.rules,
  },
];
```

### Custom Configuration

You can customize rule options or mix configs:

```js
export default [
  {
    plugins: { refined },
    rules: {
      // Start with base config
      ...refined.configs.base.rules,

      // Customize rule options
      'refined/prefer-hairline-width': ['warn', { threshold: 0.5 }],
      'refined/require-hitslop-small-touchables': ['warn', { minSize: 44 }],

      // Add individual rules as needed
      'refined/spring-config-consistency': ['warn', { reanimatedVersion: 'v3' }],
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
