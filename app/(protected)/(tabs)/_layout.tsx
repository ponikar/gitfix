import { Tabs } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Octicons>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <Octicons
      name={props.name}
      size={24}
      color={!props.focused ? "#6b7280" : "#111827"}
    />
  );
}

function ThreadIcon(props: { color: string; focused: boolean }) {
  return (
    <MaterialCommunityIcons
      name="message-text-outline"
      size={24}
      color={!props.focused ? "#6b7280" : "#111827"}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="repos"
        options={{
          title: "Repos",
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} name="feed-repo" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="threads"
        options={{
          title: "Threads",
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ color, focused }) => (
            <ThreadIcon focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
