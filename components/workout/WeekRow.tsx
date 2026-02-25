import React, { useCallback } from "react";
import { View, Text, TextInput } from "react-native";

import type { WeekData } from "../../types/workout";

interface WeekRowProps {
  week: WeekData;
  onChange: (data: Partial<WeekData>) => void;
}

export const WeekRow: React.FC<WeekRowProps> = React.memo(
  ({ week, onChange }) => {
    const handleNumberChange = useCallback(
      (key: keyof WeekData, value: string) => {
        const trimmed = value.trim();
        if (trimmed === "") {
          onChange({ [key]: null } as Partial<WeekData>);
          return;
        }

        const numeric = Number(trimmed.replace(",", "."));
        if (Number.isNaN(numeric) || numeric < 0) return;

        onChange({ [key]: numeric } as Partial<WeekData>);
      },
      [onChange]
    );

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 4,
          borderBottomWidth: 1,
          borderBottomColor: "#111827"
        }}
      >
        <Text style={{ color: "#9ca3af", width: 28 }}>S{week.week}</Text>

        <TextInput
          style={inputStyle}
          keyboardType="numeric"
          placeholder="Séries"
          placeholderTextColor="#4b5563"
          value={week.sets?.toString() ?? ""}
          onChangeText={(text) => handleNumberChange("sets", text)}
        />
        <TextInput
          style={inputStyle}
          keyboardType="numeric"
          placeholder="Reps"
          placeholderTextColor="#4b5563"
          value={week.reps?.toString() ?? ""}
          onChangeText={(text) => handleNumberChange("reps", text)}
        />
        <TextInput
          style={inputStyle}
          keyboardType="numeric"
          placeholder="Desc"
          placeholderTextColor="#4b5563"
          value={week.rest?.toString() ?? ""}
          onChangeText={(text) => handleNumberChange("rest", text)}
        />
        <TextInput
          style={inputStyle}
          keyboardType="numeric"
          placeholder="Kg"
          placeholderTextColor="#4b5563"
          value={week.load?.toString() ?? ""}
          onChangeText={(text) => handleNumberChange("load", text)}
        />

        <Text
          style={{
            color: "#e5e7eb",
            width: 70,
            textAlign: "right",
            fontVariant: ["tabular-nums"]
          }}
        >
          {week.volume != null ? week.volume.toFixed(0) : "-"}
        </Text>
      </View>
    );
  }
);

const inputStyle = {
  flex: 1,
  marginHorizontal: 4,
  paddingVertical: 4,
  paddingHorizontal: 6,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: "#1f2937",
  color: "#e5e7eb",
  fontSize: 12
} as const;

