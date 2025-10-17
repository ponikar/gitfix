import EV from "@expo/vector-icons/EvilIcons";
import { Drawer } from "expo-router/drawer";
import { Pressable } from "react-native";

export default function TabLayout() {
  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        headerShown: true,
        drawerActiveTintColor: "#0f172a",
        headerLeft: (p) => (
          <Pressable onPress={navigation.toggleDrawer} className="p-2">
            <EV name="navicon" size={26} />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen
        name="repos"
        options={{
          title: "Repos",
          drawerLabel: "Repositories",
        }}
      />
      <Drawer.Screen
        name="threads"
        options={{
          title: "Threads",
          drawerLabel: "Conversations",
        }}
      />
    </Drawer>
  );
}
