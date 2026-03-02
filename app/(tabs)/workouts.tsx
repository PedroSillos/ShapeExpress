import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors, typography, spacing } from "../../utils/theme";
import { Button } from "../../components/ui/Button";

export default function WorkoutsScreen() {
  const router = useRouter();

  const handleCreateWorkout = () => {
    router.push("/(tabs)/workout-A");
  };

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
        Treinos
      </Text>

      <Button
        onPress={handleCreateWorkout}
        style={{ marginTop: spacing.lg }}
      >
        Criar treino
      </Button>
    </ScrollView>
  );
}
