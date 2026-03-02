import React from "react";
import { View, Text } from "react-native";
import { Card } from "../ui/Card";
import type { StagnationLevel } from "../../types/workout";
import { colors, typography, spacing } from "../../utils/theme";

const statusColors = {
  progress: colors.success,
  warning: colors.warning,
  critical: colors.error,
  none: colors.textSecondary,
  suggestion: colors.warning,
};

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
  const statusColor = statusColors[status];

  return (
    <Card
      style={{
        flex: 1,
        margin: spacing.xs,
        borderLeftWidth: 4,
        borderLeftColor: statusColor,
      }}
    >
      <Text
        style={{
          ...typography.bodySmall,
          color: colors.textSecondary,
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text
          style={{
            ...typography.h2,
            color: colors.textPrimary,
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              ...typography.body,
              color: colors.textSecondary,
              marginLeft: spacing.xs,
              marginBottom: 2,
            }}
          >
            {unit}
          </Text>
        )}
      </View>
      {subtitle && (
        <Text
          style={{
            ...typography.caption,
            color: colors.textSecondary,
            marginTop: spacing.xs,
          }}
        >
          {subtitle}
        </Text>
      )}
    </Card>
  );
};

