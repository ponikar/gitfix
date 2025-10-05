import { Text, View } from "@/components/Themed";
import { useGitHubAuth } from "@/components/useGitHubAuth";
import { Button, StyleSheet } from "react-native";

export default function TabOneScreen() {
  const { token, login, logout } = useGitHubAuth();

  return (
    <View style={styles.container}>
      {token ? (
        <View>
          <Text>You are logged in.</Text>
          <Button title="Logout" onPress={logout} />
        </View>
      ) : (
        <Button title="Login with GitHub" onPress={login} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
