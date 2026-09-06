import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { theme } from '../src/theme';
import { useAppStore } from '../src/stores/appStore';
import { loadProfiles, getActiveProfileId } from '../src/lib/secure';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const biometricEnabled = useAppStore((s) => s.biometricEnabled);
  const setProfiles = useAppStore((s) => s.setProfiles);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await loadProfiles();
        setProfiles(profiles);
        const active = await getActiveProfileId();
        if (active) setActiveProfile(active);
      } catch (e) {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!biometricEnabled) {
      setUnlocked(true);
      return;
    }
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        setUnlocked(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock ENI Mobile',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      setUnlocked(result.success);
    })();
  }, [ready, biometricEnabled]);

  if (!ready || !unlocked) {
    return (
      <View style={styles.lock}>
        <StatusBar style="light" />
        <Text style={styles.lockTitle}>ENI</Text>
        <Text style={styles.lockSub}>Mobile</Text>
        {!unlocked && ready && (
          <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 24 }} />
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { ...theme.typography.title, color: theme.colors.text },
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="session/[id]"
          options={{ title: 'Session', headerBackTitle: 'Back' }}
        />
        <Stack.Screen name="connection/add" options={{ title: 'Add Connection', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  lock: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.accent,
    letterSpacing: 2,
  },
  lockSub: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});
