import { ChangesProvider } from "@/components/ActiveChangesProvider";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <ChangesProvider>
      <Stack
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen name="chat" />
      </Stack>
    </ChangesProvider>
  );
}
