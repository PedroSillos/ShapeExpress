import type React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native';
import { colors, components, typography, spacing } from '../../utils/theme';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'small';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  loading = false,
  disabled,
  style,
  ...rest 
}: ButtonProps) {
  const buttonStyle = components.button[variant];
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      style={[
        {
          height: buttonStyle.height,
          borderRadius: buttonStyle.borderRadius,
          paddingHorizontal: buttonStyle.paddingHorizontal,
          backgroundColor: isDisabled ? colors.border : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: components.touchTarget.minHeight,
        },
        style
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: variant === 'small' ? 14 : 16,
            fontWeight: '600',
          }}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
