import { View } from "@/components/Themed";
import { useGitHubAuth } from "@/components/useGitHubAuth";
import { useColorScheme } from "nativewind";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabOneScreen() {
  const { login, logout } = useGitHubAuth();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        {/* {token ? (
        <View className="items-center">
          <Text className="text-black dark:text-white">You are logged in.</Text>
          <Button title="Logout" onPress={logout} />
        </View>
      ) : ( */}
        <Button title="Login with GitHub" onPress={login} />
        {/* )} */}
      </View>
    </SafeAreaView>
  );
}
