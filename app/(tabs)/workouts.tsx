import React from "react";
import { View, Text } from "react-native";

export default function WorkoutsScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#020617",
        padding: 16
      }}
    >
      <Text
        style={{
          color: "#e5e7eb",
          fontSize: 22,
          fontWeight: "600",
          marginBottom: 8
        }}
      >
        Workouts
      </Text>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#9ca3af", fontSize: 16 }}>
          This screen will display the list of workouts.
        </Text>
      </View>
    </View>
  );
}
