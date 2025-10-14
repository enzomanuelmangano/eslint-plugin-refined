import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  error = false,
}) => {
  return (
    <View style={[styles.container, error && styles.error]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ⚠️ ESLint Warning: Missing borderCurve + thin border
  container: {
    borderWidth: 0.5,
    borderColor: '#C6C6C8',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
  },
  error: {
    borderColor: '#F44336',
    borderWidth: 0.5,
  },
  input: {
    height: 44,
    fontSize: 16,
  },
});
