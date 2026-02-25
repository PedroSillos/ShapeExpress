import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

const TAB_BG = "#020617";
const TAB_ACTIVE = "#22c55e";
const TAB_INACTIVE = "#6b7280";

const workoutTabs = ["A", "B", "C", "D", "E", "F"] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: "#111827"
        },
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              color={color}
              size={size}
            />
          )
        }}
      />

      {workoutTabs.map((id) => (
        <Tabs.Screen
          key={id}
          name={`workout-${id}`}
          options={{
            title: `Treino ${id}`,
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 1,
                  borderColor: color,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* simple text fallback instead of icon set for letters */}
              </View>
            )
          }}
        />
      ))}
    </Tabs>
  );
}

