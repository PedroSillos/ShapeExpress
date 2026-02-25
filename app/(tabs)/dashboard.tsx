import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";

import { KPICard } from "../../components/dashboard/KPICard";
import { useWorkoutStore } from "../../store/workoutStore";
import { detectStagnation } from "../../utils/stagnation";
import type { StagnationLevel } from "../../types/workout";

export default function DashboardScreen() {
  const [week, setWeek] = useState(1);
  const workouts = useWorkoutStore((s) => s.workouts);

  const {
    totalVolumeThisWeek,
    prevWeekVolume,
    volumeStatus,
    progressingCount,
    stagnantCount,
    topMuscles
  } = useMemo(() => {
    let totalVolume = 0;
    let prevVolume = 0;
    let progressing = 0;
    let stagnant = 0;
    const muscleVolume: Record<string, number> = {};

    Object.values(workouts).forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.weeks.forEach((w) => {
          if (w.volume == null) return;
          if (w.week === week) totalVolume += w.volume;
          if (w.week === week - 1) prevVolume += w.volume;
        });

        const level = detectStagnation(exercise.weeks);
        if (level === "progress") progressing += 1;
        if (level === "warning" || level === "critical") stagnant += 1;

        if (exercise.muscleGroup) {
          const sum = exercise.weeks.reduce(
            (acc, w) => acc + (w.volume ?? 0),
            0
          );
          muscleVolume[exercise.muscleGroup] =
            (muscleVolume[exercise.muscleGroup] ?? 0) + sum;
        }
      });
    });

    let status: StagnationLevel = "none";
    if (prevVolume === 0 && totalVolume > 0) status = "progress";
    else if (totalVolume > prevVolume) status = "progress";
    else if (totalVolume === prevVolume && totalVolume > 0) status = "warning";
    else if (totalVolume < prevVolume) status = "critical";

    const topMuscles = Object.entries(muscleVolume)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([muscle, vol]) => ({ muscle, volume: vol }));

    return {
      totalVolumeThisWeek: totalVolume,
      prevWeekVolume: prevVolume,
      volumeStatus: status,
      progressingCount: progressing,
      stagnantCount: stagnant,
      topMuscles
    };
  }, [week, workouts]);

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
        Dashboard
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12
        }}
      >
        <Text
          style={{
            color: "#9ca3af",
            marginRight: 8
          }}
        >
          Semana:
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((w) => (
            <Pressable
              key={w}
              onPress={() => setWeek(w)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                marginRight: 4,
                marginBottom: 4,
                backgroundColor: week === w ? "#22c55e" : "#111827"
              }}
            >
              <Text
                style={{
                  color: week === w ? "#020617" : "#e5e7eb",
                  fontSize: 12
                }}
              >
                {w}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginHorizontal: -4,
          marginBottom: 8
        }}
      >
        <KPICard
          title="Volume da semana"
          value={totalVolumeThisWeek.toFixed(0)}
          unit="kg"
          status={volumeStatus}
          subtitle={
            prevWeekVolume > 0
              ? `Semana anterior: ${prevWeekVolume.toFixed(0)} kg`
              : "Sem histórico"
          }
        />
        <KPICard
          title="Exercícios evoluindo"
          value={progressingCount.toString()}
          status="progress"
          subtitle="Stagnation = progress"
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          marginHorizontal: -4,
          marginBottom: 12
        }}
      >
        <KPICard
          title="Exercícios estagnados"
          value={stagnantCount.toString()}
          status={stagnantCount > 0 ? "warning" : "none"}
          subtitle="warning / critical"
        />
        <KPICard
          title="Grupos com mais volume"
          value={topMuscles[0]?.muscle ?? "-"}
          status="progress"
          subtitle={
            topMuscles[0]
              ? `${topMuscles[0].volume.toFixed(0)} kg`
              : "Sem dados"
          }
        />
      </View>

      <Text
        style={{
          color: "#9ca3af",
          fontSize: 14,
          marginBottom: 4
        }}
      >
        Volume por grupo muscular (top 5)
      </Text>

      <FlatList
        data={topMuscles}
        keyExtractor={(item) => item.muscle}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: "#111827"
            }}
          >
            <Text style={{ color: "#e5e7eb" }}>{item.muscle}</Text>
            <Text
              style={{
                color: "#9ca3af",
                fontVariant: ["tabular-nums"]
              }}
            >
              {item.volume.toFixed(0)} kg
            </Text>
          </View>
        )}
      />
    </View>
  );
}

