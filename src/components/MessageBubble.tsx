import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Message } from '../types';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  const isSystem = message.role === 'system';

  if (isTool) {
    return (
      <View style={[styles.bubble, styles.toolBubble]}>
        <View style={styles.toolHeader}>
          <Text style={styles.toolName}>{message.toolName ?? 'tool'}</Text>
          {message.toolStatus && (
            <Text style={styles.toolStatus}>{message.toolStatus}</Text>
          )}
        </View>
        {message.toolInput && (
          <Text style={styles.toolMeta} numberOfLines={4}>
            {typeof message.toolInput === 'string'
              ? message.toolInput
              : JSON.stringify(message.toolInput, null, 0)}
          </Text>
        )}
        {message.toolOutput ? (
          <Text style={styles.toolOutput} selectable>
            {message.toolOutput}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.asstBubble,
      ]}
    >
      <Text style={styles.role}>
        {isUser ? 'you' : isSystem ? 'system' : 'agent'}
        {isStreaming && !isUser ? ' · live' : ''}
      </Text>
      <Text style={styles.content} selectable>
        {message.content || (isStreaming && !isUser ? '▌' : '')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    maxWidth: '94%',
    marginBottom: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.accentBg,
    borderBottomRightRadius: 2,
  },
  asstBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.bgCard,
    borderBottomLeftRadius: 2,
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  toolBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.bgElevated,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.accentDim,
    maxWidth: '98%',
  },
  role: {
    ...theme.typography.labelSm,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  content: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  toolName: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  toolStatus: {
    ...theme.typography.labelSm,
    color: theme.colors.textMuted,
  },
  toolMeta: {
    ...theme.typography.monoSm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  toolOutput: {
    ...theme.typography.monoSm,
    color: theme.colors.text,
  },
});
