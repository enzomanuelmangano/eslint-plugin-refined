# prefer-hairline-width

Use `StyleSheet.hairlineWidth` instead of hardcoded values for consistent thin borders across devices. By default, this rule triggers for border width values less than or equal to 0.3.

## Options

- `threshold` (number, default: 0.3): The maximum border width value that should trigger this rule. Values must be between 0 and 1.

## Examples

### Bad

```jsx
const styles = StyleSheet.create({
  container: {
    borderWidth: 0.3, // <= default threshold
  },
});
```

### Good

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

## Configuration

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
