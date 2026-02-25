import React from "react";
import { View, Text } from "react-native";

import type { StagnationLevel } from "../../types/workout";
import { getStagnationColor } from "../../utils/colors";

interface KPICardProps {
  title: string;
  value: string;
  unit?: string;
  status: StagnationLevel;
  subtitle?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  status,
  subtitle
}) => {
  const color = getStagnationColor(status);

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color,
        padding: 12,
        margin: 4,
        backgroundColor: "#020617"
      }}
    >
      <Text
        style={{
          color: "#9ca3af",
          fontSize: 12,
          marginBottom: 4
        }}
      >
        {title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text
          style={{
            color: "#e5e7eb",
            fontSize: 22,
            fontWeight: "600"
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              color: "#6b7280",
              marginLeft: 4,
              marginBottom: 2
            }}
          >
            {unit}
          </Text>
        )}
      </View>
      {subtitle && (
        <Text
          style={{
            color: "#6b7280",
            fontSize: 11,
            marginTop: 4
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

