import React from 'react';
import { View, Text, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../src/stores/appStore';
import { theme } from '../../src/theme';

export default function SettingsScreen() {
  const biometricEnabled = useAppStore((s) => s.biometricEnabled);
  const setBiometric = useAppStore((s) => s.setBiometric);
  const wipeLocal = useAppStore((s) => s.wipeLocal);
  const profiles = useAppStore((s) => s.profiles);
  const notes = useAppStore((s) => s.notes);

  const confirmWipe = () => {
    Alert.alert(
      'Wipe local data?',
      'Clears cached messages, notes, and session list from this device. Server data is untouched.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe',
          style: 'destructive',
          onPress: () => {
            wipeLocal();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Security</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Biometric lock</Text>
        <Switch
          value={biometricEnabled}
          onValueChange={(v) => {
            setBiometric(v);
            Haptics.selectionAsync();
          }}
          trackColor={{ false: theme.colors.border, true: theme.colors.accentDim }}
          thumbColor={biometricEnabled ? theme.colors.accent : theme.colors.textMuted}
        />
      </View>

      <Text style={styles.section}>Display</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Font size</Text>
        <Text style={styles.value}>Small (locked)</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Theme</Text>
        <Text style={styles.value}>Dark · low glare</Text>
      </View>

      <Text style={styles.section}>Data</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Connections</Text>
        <Text style={styles.value}>{profiles.length}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Local notes</Text>
        <Text style={styles.value}>{notes.length}</Text>
      </View>
      <TouchableOpacity style={styles.row} onPress={confirmWipe}>
        <Text style={[styles.label, { color: theme.colors.danger }]}>
          Wipe local cache
        </Text>
      </TouchableOpacity>

      <Text style={styles.section}>About</Text>
      <Text style={styles.about}>
        ENI Mobile — personal OpenCode client{'\n'}
        Built for one operator. No telemetry. No accounts.{'\n'}
        Red-team oriented: fast approvals, quiet UI, local secrets only.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
  },
  section: {
    ...theme.typography.labelSm,
    color: theme.colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  value: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
  },
  about: {
    ...theme.typography.bodySm,
    color: theme.colors.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
});
