import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../src/stores/appStore';
import { SessionItem } from '../../src/components/SessionItem';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme';
import { createClient } from '../../src/lib/sdk';
import { getPassword } from '../../src/lib/secure';

export default function SessionsScreen() {
  const router = useRouter();
  const {
    profiles,
    activeProfileId,
    sessions,
    activeSessionId,
    isConnected,
    connectionError,
    lastHealthAt,
    autoRefreshMs,
    setSessions,
    setActiveSession,
    setConnected,
    setLastHealth,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const refresh = useCallback(
    async (silent = false) => {
      if (!activeProfile) {
        setConnected(false, 'No connection profile');
        return;
      }
      if (!silent) setRefreshing(true);
      try {
        const pass = await getPassword(activeProfile.id);
        const client = createClient(
          activeProfile.baseUrl,
          activeProfile.username,
          pass ?? undefined
        );
        const health = await client.health();
        if (!health.healthy) {
          setConnected(false, 'Server reported unhealthy');
          return;
        }
        const list = await client.listSessions();
        setSessions(list);
        setConnected(true);
        setLastHealth(Date.now());
      } catch (e: any) {
        setConnected(false, e?.message ?? 'Connection failed');
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [activeProfile]
  );

  useEffect(() => {
    if (activeProfile) {
      refresh();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => refresh(true), autoRefreshMs);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeProfileId, autoRefreshMs]);

  const createNew = async () => {
    if (!activeProfile || !isConnected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const pass = await getPassword(activeProfile.id);
      const client = createClient(
        activeProfile.baseUrl,
        activeProfile.username,
        pass ?? undefined
      );
      const s = await client.createSession();
      await refresh();
      const newId = s?.id ?? s?.session_id;
      if (newId) {
        setActiveSession(newId);
        router.push(`/session/${newId}`);
      }
    } catch {
      //
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.status}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: isConnected
                ? theme.colors.live
                : theme.colors.error,
            },
          ]}
        />
        <Text style={styles.statusText} numberOfLines={1}>
          {activeProfile
            ? `${activeProfile.name} · ${
                isConnected ? 'online' : connectionError ?? 'offline'
              }`
            : 'No connection'}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/connection/add')}
          hitSlop={theme.hitSlop}
        >
          <Text style={styles.link}>+ Conn</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionItem
            session={item}
            active={item.id === activeSessionId}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveSession(item.id);
              router.push(`/session/${item.id}`);
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => refresh(false)}
            tintColor={theme.colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeProfile
                ? isConnected
                  ? 'No sessions. Create one below.'
                  : 'Pull to retry connection.'
                : 'Add a connection first.'}
            </Text>
          </View>
        }
        contentContainerStyle={sessions.length === 0 ? { flex: 1 } : undefined}
      />

      <View style={styles.footer}>
        <Button
          title="New Session"
          onPress={createNew}
          disabled={!isConnected}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...theme.typography.bodyXs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  link: {
    ...theme.typography.labelSm,
    color: theme.colors.accent,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
});
