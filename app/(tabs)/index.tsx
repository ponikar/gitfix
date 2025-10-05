import { Text, View } from "@/components/Themed";
import { useGitHubAuth } from "@/components/useGitHubAuth";
import { useColorScheme } from "nativewind";
import { Button, Switch } from "react-native";

export default function TabOneScreen() {
  const { token, login, logout } = useGitHubAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      {token ? (
        <View className="items-center">
          <Text className="text-black dark:text-white">You are logged in.</Text>
          <Button title="Logout" onPress={logout} />
        </View>
      ) : (
        <Button title="Login with GitHub" onPress={login} />
      )}
      <View style={{ height: 30 }} />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text className="text-black dark:text-white">Dark Mode</Text>
        <Switch value={colorScheme === "dark"} onChange={toggleColorScheme} />
      </View>
    </View>
  );
}
