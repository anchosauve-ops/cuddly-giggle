import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/theme';

export default function TerminalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terminal</Text>
      <Text style={styles.body}>
        Compact remote terminal surface. Connects when the OpenCode server exposes a PTY endpoint.
        {'\n\n'}
        For red-team use: keep sessions short-lived, clear scrollback after sensitive commands, and prefer SSH local-forward when possible.
      </Text>
      <Text style={styles.note}>Coming in next iteration — core chat + tool approval first.</Text>
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
