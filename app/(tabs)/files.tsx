import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/theme';

export default function FilesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Files</Text>
      <Text style={styles.body}>
        Project file tree + quick open into chat context.
        {'\n\n'}
        Designed for fast navigation of scripts, configs, and loot during ops without leaving the phone.
      </Text>
      <Text style={styles.note}>Scaffold ready — full tree in next pass.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.text,
    marginBottom: 8,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  note: {
    ...theme.typography.bodyXs,
    color: theme.colors.textMuted,
    marginTop: 16,
  },
});
