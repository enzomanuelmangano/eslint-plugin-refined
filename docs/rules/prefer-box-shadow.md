# prefer-box-shadow

Suggests using `boxShadow` instead of individual shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation`) for better performance and simpler syntax. The rule automatically converts shadow properties to the CSS-like `boxShadow` format and removes `elevation` (Android-specific) as `boxShadow` now provides cross-platform shadow support.

## Examples

### Bad

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

### Good

```jsx
const styles = StyleSheet.create({
  container: {
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
});
```
