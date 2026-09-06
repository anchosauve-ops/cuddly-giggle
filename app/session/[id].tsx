import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../src/stores/appStore';
import { Button } from '../../src/components/Button';
import { PermissionBar } from '../../src/components/PermissionBar';
import { MessageBubble } from '../../src/components/MessageBubble';
import { theme } from '../../src/theme';
import { createClient } from '../../src/lib/sdk';
import { getPassword } from '../../src/lib/secure';
import { Message } from '../../src/types';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    profiles,
    activeProfileId,
    messages,
    isStreaming,
    pendingPermission,
    setMessages,
    appendMessage,
    updateLastAssistant,
    setStreaming,
    setPendingPermission,
    addNote,
    wipeLocal,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const loadSession = useCallback(async () => {
    if (!id || !activeProfile) return;
    try {
      const pass = await getPassword(activeProfile.id);
      const client = createClient(
        activeProfile.baseUrl,
        activeProfile.username,
        pass ?? undefined
      );
      const { messages: msgs } = await client.getSession(id);
      setMessages(msgs);
    } catch {
      // keep current
    }
  }, [id, activeProfileId]);

  useEffect(() => {
    loadSession();
    // light poll while screen is open (helps when SSE not yet wired)
    pollRef.current = setInterval(loadSession, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadSession]);

  const send = async () => {
    if (!input.trim() || !activeProfile || !id || sending) return;
    const prompt = input.trim();
    setInput('');
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    appendMessage({
      id: `local-u-${Date.now()}`,
      role: 'user',
      content: prompt,
      createdAt: Date.now(),
    });

    const asstId = `local-a-${Date.now()}`;
    appendMessage({
      id: asstId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    });
    setStreaming(true);

    try {
      const pass = await getPassword(activeProfile.id);
      const client = createClient(
        activeProfile.baseUrl,
        activeProfile.username,
        pass ?? undefined
      );
      await client.sendPrompt(id, prompt);
      // refresh to pull real response / tool events
      setTimeout(loadSession, 1200);
    } catch (e: any) {
      updateLastAssistant(`Error: ${e?.message ?? 'request failed'}`);
    } finally {
      setSending(false);
      setStreaming(false);
    }
  };

  const handleApprove = async () => {
    if (!pendingPermission || !activeProfile) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const pass = await getPassword(activeProfile.id);
      const client = createClient(
        activeProfile.baseUrl,
        activeProfile.username,
        pass ?? undefined
      );
      await client.approveTool(pendingPermission.id, 'approve');
    } catch {
      // still clear UI
    }
    setPendingPermission(null);
    setTimeout(loadSession, 800);
  };

  const handleDeny = async () => {
    if (!pendingPermission || !activeProfile) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      const pass = await getPassword(activeProfile.id);
      const client = createClient(
        activeProfile.baseUrl,
        activeProfile.username,
        pass ?? undefined
      );
      await client.approveTool(pendingPermission.id, 'deny');
    } catch {
      //
    }
    setPendingPermission(null);
  };

  const addQuickNote = () => {
    Alert.prompt?.(
      'Local note',
      'Stays on device only',
      (text) => {
        if (!text?.trim() || !id) return;
        addNote({
          id: `note-${Date.now()}`,
          sessionId: id,
          text: text.trim(),
          createdAt: Date.now(),
          sensitive: true,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      'plain-text'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={78}
    >
      {/* compact header actions */}
      <View style={styles.topBar}>
        <Text style={styles.sessionId} numberOfLines={1}>
          {id?.slice(0, 12)}
        </Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={addQuickNote} hitSlop={theme.hitSlop}>
            <Text style={styles.topLink}>note</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Wipe local view?', 'Clears messages & notes on this device only', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Wipe',
                  style: 'destructive',
                  onPress: () => {
                    wipeLocal();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  },
                },
              ]);
            }}
            hitSlop={theme.hitSlop}
          >
            <Text style={[styles.topLink, { color: theme.colors.danger }]}>wipe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isStreaming={isStreaming && item.role === 'assistant'}
          />
        )}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Session empty. Send a prompt.</Text>
          </View>
        }
      />

      {pendingPermission && (
        <PermissionBar
          request={pendingPermission}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="prompt…"
          placeholderTextColor={theme.colors.textDim}
          multiline
          maxLength={12000}
          editable={!sending}
        />
        <Button
          title={sending ? '…' : 'Send'}
          onPress={send}
          disabled={!input.trim() || sending}
          compact
          style={{ minWidth: 58 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  sessionId: {
    ...theme.typography.monoSm,
    color: theme.colors.textDim,
  },
  topActions: {
    flexDirection: 'row',
    gap: 14,
  },
  topLink: {
    ...theme.typography.labelSm,
    color: theme.colors.accent,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: 12,
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.bgElevated,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxHeight: 110,
  },
});
