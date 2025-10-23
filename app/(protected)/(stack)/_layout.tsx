import { ChangesProvider } from "@/components/ActiveChangesProvider";
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <ChangesProvider>
      <Stack>
        <Stack.Screen
          name="chat"
          options={({ route }) => {
            const params = route.params as
              | { owner?: string; repo?: string }
              | undefined;
            return {
              title:
                params?.owner && params?.repo
                  ? `${params.owner}/${params.repo}`
                  : "Chat",
              headerBackVisible: true,
              headerBackTitle: "Back",
            };
          }}
        />
        <Stack.Screen
          name="file-viewer"
          options={({ route }) => {
            const params = route.params as { fileName?: string } | undefined;
            return {
              title: params?.fileName || "File Viewer",
              headerBackVisible: true,
              headerBackTitle: "Back",
            };
          }}
        />
      </Stack>
    </ChangesProvider>
  );
}
