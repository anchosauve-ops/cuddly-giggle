import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { theme } from '../theme';
import { PermissionRequest } from '../types';

interface Props {
  request: PermissionRequest;
  onApprove: () => void;
  onDeny: () => void;
  onEdit?: () => void;
}

export function PermissionBar({ request, onApprove, onDeny, onEdit }: Props) {
  const riskColor =
    request.risk === 'high'
      ? theme.colors.danger
      : request.risk === 'medium'
      ? theme.colors.warning
      : theme.colors.textMuted;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.tool}>{request.tool}</Text>
        {request.risk && (
          <Text style={[styles.risk, { color: riskColor }]}>
            {request.risk.toUpperCase()}
          </Text>
        )}
      </View>
      <Text style={styles.desc} numberOfLines={3}>
        {request.description}
      </Text>
      <View style={styles.actions}>
        <Button title="Deny" variant="deny" compact onPress={onDeny} style={styles.btn} />
        {onEdit && (
          <Button title="Edit" variant="edit" compact onPress={onEdit} style={styles.btn} />
        )}
        <Button title="Approve" variant="approve" compact onPress={onApprove} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.bgElevated,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tool: {
    ...theme.typography.label,
    color: theme.colors.accent,
  },
  risk: {
    ...theme.typography.labelSm,
    fontWeight: '700',
  },
  desc: {
    ...theme.typography.bodySm,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flex: 1,
  },
});
