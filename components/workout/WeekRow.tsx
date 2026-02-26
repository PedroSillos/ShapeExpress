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
      (key: "sets" | "reps" | "load", value: string) => {
        const trimmed = value.trim();
        if (trimmed === "") {
          onChange({ [key]: null });
          return;
        }

        const numeric = Number(trimmed.replace(",", "."));
        if (Number.isNaN(numeric) || numeric < 0) return;

        onChange({ [key]: numeric });
      },
      [onChange]
    );

    const handleTextChange = useCallback(
      (key: "rest", value: string) => {
        onChange({ [key]: value });
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
          placeholder="Kg"
          placeholderTextColor="#4b5563"
          value={week.load?.toString() ?? ""}
          onChangeText={(text) => handleNumberChange("load", text)}
        />
        <TextInput
          style={inputStyle}
          keyboardType="default"
          placeholder="Desc"
          placeholderTextColor="#4b5563"
          value={week.rest?.toString() ?? ""}
          onChangeText={(text) => handleTextChange("rest", text)}
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

