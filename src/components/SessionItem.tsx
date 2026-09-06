import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { theme } from '../theme';
import { SessionSummary } from '../types';

interface Props {
  session: SessionSummary;
  active?: boolean;
  onPress: () => void;
}

const statusColor = {
  idle: theme.colors.idle,
  running: theme.colors.live,
  waiting: theme.colors.warning,
  error: theme.colors.error,
  completed: theme.colors.textMuted,
};

export function SessionItem({ session, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, active && styles.active]}
      activeOpacity={0.7}
    >
      <View style={[styles.dot, { backgroundColor: statusColor[session.status] }]} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {session.title}
        </Text>
        <View style={styles.meta}>
          {session.project && (
            <Text style={styles.metaText} numberOfLines={1}>
              {session.project}
            </Text>
          )}
          <Text style={styles.metaText}>
            {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
          </Text>
        </View>
      </View>
      {session.model && (
        <Text style={styles.model} numberOfLines={1}>
          {session.model}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSubtle,
  },
  active: {
    backgroundColor: theme.colors.accentBg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  body: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaText: {
    ...theme.typography.bodyXs,
    color: theme.colors.textMuted,
  },
  model: {
    ...theme.typography.bodyXs,
    color: theme.colors.textDim,
    maxWidth: 70,
  },
});
