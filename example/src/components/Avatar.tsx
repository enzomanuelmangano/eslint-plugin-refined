import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  initials: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 'medium',
  color = '#007AFF'
}) => {
  return (
    <View style={[styles.container, styles[size], { backgroundColor: color }]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // ⚠️ ESLint Warning: Missing borderCurve on all rounded elements
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 48,
    height: 48,
  },
  large: {
    width: 64,
    height: 64,
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 24,
  },
});
