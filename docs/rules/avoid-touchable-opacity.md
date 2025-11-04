# avoid-touchable-opacity

Avoid using `TouchableOpacity` - you should care about your touchables and use more performant alternatives.

## Examples

### Bad

```jsx
<TouchableOpacity onPress={handlePress}>
  <Text>Press me</Text>
</TouchableOpacity>
```

### Good

```jsx
<Pressable onPress={handlePress}>
  <Text>Press me</Text>
</Pressable>
```
