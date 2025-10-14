import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Input } from '../components';

export const HomeScreen: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar initials="RN" size="large" />
        <Text style={styles.title}>ESLint Plugin Refined</Text>
        <Text style={styles.subtitle}>Demo Application</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards</Text>
        <Card
          title="Default Card"
          description="This card uses default styling"
        />
        <Card
          title="Success Card"
          description="This card has success styling"
          variant="success"
        />
        <Card
          title="Warning Card"
          description="This card has warning styling"
          variant="warning"
        />
        <Card
          title="Error Card"
          description="This card has error styling"
          variant="error"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>
        <Button label="Primary Button" onPress={() => {}} />
        <Button label="Secondary Button" onPress={() => {}} variant="secondary" />
        <Button label="Outline Button" onPress={() => {}} variant="outline" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Input</Text>
        <Input
          placeholder="Enter text..."
          value={inputValue}
          onChangeText={setInputValue}
        />
      </View>

      <View style={styles.avatarSection}>
        <Text style={styles.sectionTitle}>Avatars</Text>
        <View style={styles.avatarRow}>
          <Avatar initials="JS" size="small" color="#FF6B6B" />
          <Avatar initials="RN" size="medium" color="#4ECDC4" />
          <Avatar initials="TS" size="large" color="#45B7D1" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  // ⚠️ ESLint Warning: Missing borderCurve + shadow properties
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  avatarSection: {
    padding: 16,
    marginBottom: 32,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
});
