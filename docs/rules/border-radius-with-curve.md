# border-radius-with-curve

Enforces using `borderCurve: 'continuous'` when borderRadius properties are used for better visual quality on iOS.

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
