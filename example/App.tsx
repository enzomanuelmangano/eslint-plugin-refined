import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ESLint Plugin Refined Demo</Text>
      <Text style={styles.subtitle}>Check the examples below for style violations</Text>

      {/* Example 1: Missing borderCurve */}
      <View style={styles.cardWithoutCurve}>
        <Text>This card has borderRadius but no borderCurve ⚠️</Text>
      </View>

      {/* Example 2: Using thin border instead of hairlineWidth */}
      <View style={styles.cardWithThinBorder}>
        <Text>This card uses 0.5 border width instead of hairlineWidth ⚠️</Text>
      </View>

      {/* Example 3: Using individual shadow properties */}
      <View style={styles.cardWithShadow}>
        <Text>This card uses individual shadow properties ⚠️</Text>
      </View>

      {/* Example 4: Correct usage */}
      <View style={styles.cardCorrect}>
        <Text>This card follows all best practices ✅</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  // ⚠️ ESLint Warning: Missing borderCurve
  cardWithoutCurve: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    borderCurve: 'continuous',
  },
  // ⚠️ ESLint Warning: Use StyleSheet.hairlineWidth
  cardWithThinBorder: {
    backgroundColor: 'white',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 12,
    borderCurve: 'continuous',
    marginBottom: 12,
    width: '100%',
  },
  // ⚠️ ESLint Warning: Use boxShadow instead
  cardWithShadow: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    width: '100%',
  },
  // ✅ Correct: All best practices followed
  cardCorrect: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    marginBottom: 12,
    width: '100%',
  },
});
