import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../utils/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.xl,
      }}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={64}
          color={colors.textSecondary}
          style={{ marginBottom: spacing.lg }}
        />
      )}
      <Text
        style={{
          ...typography.h2,
          color: colors.textPrimary,
          marginBottom: spacing.sm,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          ...typography.body,
          color: colors.textSecondary,
          marginBottom: spacing.xl,
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}
