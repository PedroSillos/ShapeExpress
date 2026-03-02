import type React from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { colors, components, spacing, typography } from '../../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text
          style={{
            ...typography.body,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        style={[
          {
            height: components.input.height,
            borderRadius: components.input.borderRadius,
            borderWidth: components.input.borderWidth,
            borderColor: error ? colors.error : colors.border,
            paddingHorizontal: components.input.paddingHorizontal,
            paddingVertical: components.input.paddingVertical,
            fontSize: components.input.fontSize,
            backgroundColor: colors.background,
            color: colors.textPrimary,
          },
          style
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
      {error && (
        <Text
          style={{
            ...typography.bodySmall,
            color: colors.error,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
