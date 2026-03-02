import React, { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { KPICard } from "../../components/dashboard/KPICard";
import { useWorkoutStore } from "../../store/workoutStore";
import { detectStagnation } from "../../utils/stagnation";
import type { StagnationLevel } from "../../types/workout";
import { colors, typography, spacing, components } from "../../utils/theme";

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

  const kpiData = [
    {
      title: "Volume da semana",
      value: totalVolumeThisWeek.toFixed(0),
      unit: "kg",
      status: volumeStatus,
      subtitle:
        prevWeekVolume > 0
          ? `Semana anterior: ${prevWeekVolume.toFixed(0)} kg`
          : "Sem histórico"
    },
    {
      title: "Exercícios evoluindo",
      value: progressingCount.toString(),
      status: "progress" as StagnationLevel,
      subtitle: "Em progresso"
    },
    {
      title: "Exercícios estagnados",
      value: stagnantCount.toString(),
      status:
        stagnantCount > 0 ? ("warning" as StagnationLevel) : ("none" as StagnationLevel),
      subtitle: "Necessitam atenção"
    },
    {
      title: "Grupos com mais volume",
      value: topMuscles[0]?.muscle ?? "-",
      status: "progress" as StagnationLevel,
      subtitle: topMuscles[0]
        ? `${topMuscles[0].volume.toFixed(0)} kg`
        : "Sem dados"
    }
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        padding: spacing.md,
      }}
    >
      <Text
        style={{
          ...typography.h1,
          color: colors.textPrimary,
          marginBottom: spacing.sm,
          marginTop: spacing.xl,
        }}
      >
        Dashboard
      </Text>

      <View
        style={{
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={{
            ...typography.body,
            color: colors.textSecondary,
            marginBottom: spacing.sm,
          }}
        >
          Semana:
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((w) => (
            <Pressable
              key={w}
              onPress={() => setWeek(w)}
              style={{
                minWidth: components.touchTarget.minWidth,
                minHeight: components.touchTarget.minHeight,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: 8,
                backgroundColor: week === w ? colors.primary : colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  ...typography.body,
                  color: week === w ? colors.textPrimary : colors.textPrimary,
                  fontWeight: '600',
                }}
              >
                {w}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={kpiData}
        numColumns={2}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => <KPICard {...item} />}
        scrollEnabled={false}
        style={{ marginHorizontal: -spacing.xs, marginBottom: spacing.xl }}
      />

      <Text
        style={{
          ...typography.h3,
          color: colors.textPrimary,
          marginBottom: spacing.md,
        }}
      >
        Volume por grupo muscular
      </Text>

      {topMuscles.map((item) => (
        <View
          key={item.muscle}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ ...typography.body, color: colors.textPrimary }}>
            {item.muscle}
          </Text>
          <Text
            style={{
              ...typography.body,
              color: colors.textSecondary,
              fontVariant: ["tabular-nums"],
            }}
          >
            {item.volume.toFixed(0)} kg
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
