# spring-config-consistency

Spring animation must include all three spring physics params (`mass`, `damping`, `stiffness`) or none of them. This ensures consistent spring animations and prevents incomplete configurations.

This rule works with:
- `withSpring` calls (ignores calls using `duration` or `dampingRatio` as these are alternative modes)
- Transition `springify()` chains (e.g., `LinearTransition.springify().mass(1).damping(30).stiffness(250)`)

## Options

- `reanimatedVersion` (string, default: 'v4'): Specifies which React Native Reanimated version defaults to use in auto-fix:
  - `'v4'`: Uses Reanimated v4 defaults (mass: 4, damping: 120, stiffness: 900)
  - `'v3'`: Uses Reanimated v3 defaults (mass: 4, damping: 10, stiffness: 100)

## Examples

### Bad

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

### Good

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

## Configuration

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
