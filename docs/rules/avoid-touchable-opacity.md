# avoid-touchable-opacity

Discourages usage of `TouchableOpacity` component in favor of more performant alternatives.

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
