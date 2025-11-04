# border-radius-with-curve

When using borderRadius properties, you should also specify `borderCurve: 'continuous'` for beautiful rounded corners on iOS.

## Examples

### Bad

```jsx
const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
  },
});
```

### Good

```jsx
const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderCurve: 'continuous',
  },
});
```
