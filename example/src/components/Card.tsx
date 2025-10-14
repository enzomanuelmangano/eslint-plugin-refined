import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CardProps } from '../types';

export const Card: React.FC<CardProps> = ({ title, description, variant = 'default' }) => {
  return (
    <View style={[styles.container, styles[variant]]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // ⚠️ ESLint Warning: Missing borderCurve
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  default: {
    backgroundColor: 'white',
  },
  success: {
    backgroundColor: '#E8F5E9',
    borderWidth: 0.5,
    borderColor: '#4CAF50',
  },
  warning: {
    backgroundColor: '#FFF3E0',
    borderWidth: 0.5,
    borderColor: '#FF9800',
  },
  error: {
    backgroundColor: '#FFEBEE',
    borderWidth: 0.5,
    borderColor: '#F44336',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});
