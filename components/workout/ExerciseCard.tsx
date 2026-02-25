import React, { useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import type { Exercise, WorkoutId, WeekData } from "../../types/workout";
import { useWorkoutStore } from "../../store/workoutStore";
import { getStagnationColor } from "../../utils/colors";
import { detectStagnation } from "../../utils/stagnation";
import { WeekRow } from "./WeekRow";

interface ExerciseCardProps {
  workoutId: WorkoutId;
  exercise: Exercise;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = React.memo(
  ({ workoutId, exercise }) => {
    const updateWeekData = useWorkoutStore((s) => s.updateWeekData);
    const updateExercise = useWorkoutStore((s) => s.updateExercise);
    const autoFillWeeks = useWorkoutStore((s) => s.autoFillWeeks);
    const resetExercise = useWorkoutStore((s) => s.resetExercise);

    const stagnationLevel = detectStagnation(exercise.weeks);
    const headerColor = getStagnationColor(stagnationLevel);

    const handleWeekChange = useCallback(
      (week: WeekData, data: Partial<WeekData>) => {
        updateWeekData(workoutId, exercise.index, week.week, data);

        if (week.week === 1) {
          autoFillWeeks(workoutId, exercise.index, 1);
        }
      },
      [autoFillWeeks, exercise.index, updateWeekData, workoutId]
    );

    const handleNameChange = useCallback(
      (text: string) => {
        updateExercise(workoutId, exercise.index, { name: text });
      },
      [exercise.index, updateExercise, workoutId]
    );

    const handleReset = useCallback(() => {
      resetExercise(workoutId, exercise.index);
    }, [exercise.index, resetExercise, workoutId]);

    return (
      <View
        style={{
          marginBottom: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#1f2937",
          backgroundColor: "#020617",
          overflow: "hidden"
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#111827",
            backgroundColor: "#020617"
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              style={{
                color: "#e5e7eb",
                fontSize: 16,
                fontWeight: "600"
              }}
              placeholder={`Exercício ${exercise.index + 1}`}
              placeholderTextColor="#4b5563"
              value={exercise.name}
              onChangeText={handleNameChange}
            />
            {exercise.muscleGroup && (
              <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                {exercise.muscleGroup}
              </Text>
            )}
          </View>

          <View
            style={{
              alignItems: "flex-end"
            }}
          >
            <Text
              style={{
                color: headerColor,
                fontSize: 12,
                marginBottom: 4
              }}
            >
              {stagnationLevel === "progress"
                ? "Progredindo"
                : stagnationLevel === "warning"
                ? "Atenção"
                : stagnationLevel === "critical"
                ? "Estagnado"
                : "Sem dados"}
            </Text>
            <Text
              style={{
                color: "#e5e7eb",
                fontSize: 12,
                fontWeight: "500"
              }}
            >
              Volume total: {exercise.totalVolume.toFixed(0)}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginBottom: 4
            }}
          >
            <Text style={{ color: "#6b7280", width: 28 }} />
            <Text style={headerCellStyle}>Séries</Text>
            <Text style={headerCellStyle}>Reps</Text>
            <Text style={headerCellStyle}>Desc</Text>
            <Text style={headerCellStyle}>Carga</Text>
            <Text
              style={{
                color: "#6b7280",
                width: 70,
                textAlign: "right",
                fontSize: 10
              }}
            >
              Volume
            </Text>
          </View>

          {exercise.weeks.map((week) => (
            <WeekRow
              key={week.week}
              week={week}
              onChange={(data) => handleWeekChange(week, data)}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 12,
            paddingBottom: 8
          }}
        >
          <TouchableOpacity onPress={handleReset}>
            <Text style={{ color: "#f97316", fontSize: 12 }}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const headerCellStyle = {
  flex: 1,
  color: "#6b7280",
  fontSize: 10,
  textAlign: "left"
} as const;

