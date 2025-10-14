import { StyleSheet } from 'react-native';

/**
 * Utility function to create styles with common patterns
 */
export const createCardStyle = (borderRadiusValue: number) => {
  // ⚠️ ESLint Warning: Missing borderCurve
  return {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: borderRadiusValue,
    marginBottom: 12,
  };
};

/**
 * Creates a border style with thin width
 */
export const createBorderStyle = (color: string) => {
  // ⚠️ ESLint Warning: Should use StyleSheet.hairlineWidth
  return {
    borderWidth: 0.5,
    borderColor: color,
  };
};

/**
 * Merges multiple style objects
 */
export const mergeStyles = (...styles: any[]) => {
  return Object.assign({}, ...styles);
};

/**
 * Helper to create consistent spacing
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
