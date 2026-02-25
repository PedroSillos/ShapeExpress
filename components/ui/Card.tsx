import type React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#1f2937",
          backgroundColor: "#020617",
          padding: 16
        },
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

