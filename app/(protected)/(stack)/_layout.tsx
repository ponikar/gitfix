import { ChangesProvider } from "@/components/ActiveChangesProvider";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <ChangesProvider>
      <Stack>
        <Stack.Screen
          name="chat"
          options={{
            title: "Chat",
            headerBackVisible: true,
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </ChangesProvider>
  );
}
