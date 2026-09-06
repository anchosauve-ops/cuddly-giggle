import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';

type Variant = 'primary' | 'ghost' | 'danger' | 'approve' | 'deny' | 'edit';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  compact?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  textStyle,
  compact,
}: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        compact && styles.compact,
        variantStyles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      hitSlop={theme.hitSlop}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.text} />
      ) : (
        <Text style={[styles.text, textStyles[variant], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  compact: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    minHeight: 28,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  approve: {
    backgroundColor: theme.colors.approve,
  },
  deny: {
    backgroundColor: theme.colors.deny,
  },
  edit: {
    backgroundColor: theme.colors.edit,
  },
};

const textStyles: Record<Variant, TextStyle> = {
  primary: { color: '#0a0a0b', fontWeight: '600' },
  ghost: { color: theme.colors.textSecondary },
  danger: { color: '#fff' },
  approve: { color: '#0a0a0b', fontWeight: '600' },
  deny: { color: '#fff', fontWeight: '600' },
  edit: { color: '#fff', fontWeight: '600' },
};
