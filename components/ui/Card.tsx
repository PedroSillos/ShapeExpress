import type React from "react";
import { View, type ViewProps } from "react-native";
import { colors, components, spacing } from "../../utils/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          borderRadius: components.card.borderRadius,
          backgroundColor: colors.surface,
          padding: components.card.padding,
          ...components.card.shadow,
        },
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

