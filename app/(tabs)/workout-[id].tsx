import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";

import type { WorkoutId } from "../../types/workout";
import { useWorkoutStore } from "../../store/workoutStore";
import { MAX_EXERCISES } from "../../utils/constants";
import { ExerciseCard } from "../../components/workout/ExerciseCard";

export default function WorkoutScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const rawId = (params.id ?? "A").toString().toUpperCase();
  const workoutId = (["A", "B", "C", "D", "E", "F"].includes(rawId)
    ? rawId
    : "A") as WorkoutId;

  const workout = useWorkoutStore((s) => s.workouts[workoutId]);

  if (!workout) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020617"
        }}
      >
        <Text style={{ color: "#e5e7eb" }}>Treino não encontrado.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#020617",
        paddingHorizontal: 16,
        paddingTop: 16
      }}
    >
      <View
        style={{
          marginBottom: 16
        }}
      >
        <Text
          style={{
            color: "#e5e7eb",
            fontSize: 22,
            fontWeight: "600",
            marginBottom: 4
          }}
        >
          {workout.label}
        </Text>
        <Text
          style={{
            color: "#9ca3af",
            fontSize: 12
          }}
        >
          Volume total: {workout.totalVolume.toFixed(0)} | Exercícios:{" "}
          {workout.exercises.length}/{MAX_EXERCISES}
        </Text>
      </View>

      <FlatList
        data={workout.exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseCard workoutId={workoutId} exercise={item} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

