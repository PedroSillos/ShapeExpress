import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Página não encontrada" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: "#020617"
        }}
      >
        <Text style={{ color: "#e5e7eb", fontSize: 20, marginBottom: 8 }}>
          404
        </Text>
        <Text style={{ color: "#9ca3af", textAlign: "center", marginBottom: 16 }}>
          Tela não encontrada.
        </Text>
        <Link
          href="/(tabs)/dashboard"
          style={{ color: "#22c55e", fontWeight: "600", fontSize: 16 }}
        >
          Voltar para o dashboard
        </Link>
      </View>
    </>
  );
}

