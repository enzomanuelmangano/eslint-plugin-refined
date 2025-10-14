# ESLint Plugin Refined - Example Project

This is an example Expo project demonstrating the `eslint-plugin-refined` in action.

## What is eslint-plugin-refined?

A minimal ESLint plugin for refined React Native styles that enforces best practices for:
- Using `borderCurve: 'continuous'` with borderRadius
- Using `StyleSheet.hairlineWidth` for thin borders
- Using `boxShadow` instead of individual shadow properties

## Setup

```bash
npm install
```

## Run the linter

```bash
npm run lint
```

This will show ESLint warnings for the style violations in `App.tsx`.

## Auto-fix violations

```bash
npm run lint:fix
```

This will automatically fix the style issues where possible.

## Run the app

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## Example Violations

The `App.tsx` file includes examples of all three rule violations:

### 1. Missing borderCurve ⚠️
```typescript
cardWithoutCurve: {
  borderRadius: 12, // Missing borderCurve!
}
```

**Fix:**
```typescript
cardWithoutCurve: {
  borderRadius: 12,
  borderCurve: 'continuous', // ✅
}
```

### 2. Thin border without hairlineWidth ⚠️
```typescript
cardWithThinBorder: {
  borderWidth: 0.5, // Should use hairlineWidth!
}
```

**Fix:**
```typescript
cardWithThinBorder: {
  borderWidth: StyleSheet.hairlineWidth, // ✅
}
```

### 3. Individual shadow properties ⚠️
```typescript
cardWithShadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}
```

**Suggestion:**
```typescript
cardWithShadow: {
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // ✅
}
```

## Learn More

Check out the main plugin README for full documentation and configuration options.
