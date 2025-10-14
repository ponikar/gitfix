import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

import Octicons from "@expo/vector-icons/Octicons";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
  focused: boolean;
}) {
  return (
    <Octicons
      name="feed-repo"
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
            <TabBarIcon focused={focused} name="code" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
