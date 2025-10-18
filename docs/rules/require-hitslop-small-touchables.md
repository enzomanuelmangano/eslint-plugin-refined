# require-hitslop-small-touchables

Requires `hitSlop` prop on touchable elements that are smaller than a configurable threshold (default: 40pt) to improve tap target size and accessibility. This rule detects touchable elements by checking for press handler props (`onPress`, `onLongPress`, etc.) rather than specific component names, making it work with any custom touchable component.

## Options

- `minSize` (number, default: 40): The minimum recommended size for touchable elements in points. Elements smaller than this should have `hitSlop`.

## Examples

### Bad

```jsx
// Small touchable without hitSlop
<Pressable onPress={handlePress} style={{ width: 30, height: 30 }}>
  <Icon name="close" />
</Pressable>

// Custom component with small size
<IconButton onPress={handlePress} style={{ width: 24, height: 24 }}>
  <Icon name="settings" />
</IconButton>

// StyleSheet reference
const styles = StyleSheet.create({
  icon: { width: 32, height: 32 }
});
<TouchableOpacity onPress={handlePress} style={styles.icon}>
  <Icon name="menu" />
</TouchableOpacity>
```

### Good

```jsx
// Small touchable with hitSlop
<Pressable
  onPress={handlePress}
  style={{ width: 30, height: 30 }}
  hitSlop={10}
>
  <Icon name="close" />
</Pressable>

// Large enough touchable (>= 40pt)
<Pressable onPress={handlePress} style={{ width: 44, height: 44 }}>
  <Icon name="settings" />
</Pressable>

// Not a touchable (no press handlers)
<View style={{ width: 20, height: 20 }}>
  <Icon name="info" />
</View>
```

## Configuration

```js
// Use default threshold of 40pt (automatically enabled in recommended config)
rules: {
  'refined/require-hitslop-small-touchables': 'warn',
}

// Stricter: iOS/Android minimum (44pt)
rules: {
  'refined/require-hitslop-small-touchables': ['warn', { minSize: 44 }],
}

// More lenient: 30pt
rules: {
  'refined/require-hitslop-small-touchables': ['warn', { minSize: 30 }],
}
```

**Note:** This rule checks both inline styles and `StyleSheet.create` references. It detects touchable elements by looking for press handler props, so it works with any component (Pressable, TouchableOpacity, custom components, even View).
