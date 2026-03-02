import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { colors, typography, spacing } from '../../utils/theme';

interface LoadingProps {
  message?: string;
}

export function Loading({ message }: LoadingProps) {
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
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text
          style={{
            ...typography.body,
            color: colors.textSecondary,
            marginTop: spacing.md,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
