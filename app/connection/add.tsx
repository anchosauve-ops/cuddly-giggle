import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme';
import { useAppStore } from '../../src/stores/appStore';
import { saveProfiles, savePassword, setActiveProfileId } from '../../src/lib/secure';
import { ConnectionProfile } from '../../src/types';

export default function AddConnection() {
  const router = useRouter();
  const { profiles, setProfiles, setActiveProfile } = useAppStore();

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const save = async () => {
    if (!name.trim() || !baseUrl.trim()) {
      Alert.alert('Missing fields', 'Name and URL are required');
      return;
    }
    const id = `p-${Date.now()}`;
    const profile: ConnectionProfile = {
      id,
      name: name.trim(),
      baseUrl: baseUrl.trim().replace(/\/$/, ''),
      username: username.trim() || undefined,
      createdAt: Date.now(),
      isDefault: profiles.length === 0,
    };
    const next = [...profiles, profile];
    setProfiles(next);
    await saveProfiles(next);
    if (password) await savePassword(id, password);
    setActiveProfile(id);
    await setActiveProfileId(id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Home lab / Tailscale / CF"
        placeholderTextColor={theme.colors.textDim}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Server URL</Text>
      <TextInput
        style={styles.input}
        value={baseUrl}
        onChangeText={setBaseUrl}
        placeholder="https://opencode.example.com"
        placeholderTextColor={theme.colors.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <Text style={styles.label}>Username (optional)</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="basic auth user"
        placeholderTextColor={theme.colors.textDim}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password (stored securely)</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={theme.colors.textDim}
        secureTextEntry
      />

      <Button title="Save Connection" onPress={save} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.lg,
  },
  label: {
    ...theme.typography.labelSm,
    color: theme.colors.textMuted,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
