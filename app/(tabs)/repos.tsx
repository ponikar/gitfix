import { Text, View } from "@/components/Themed";
import { useRepos } from "@/lib/useRepos";
import { useAuthState } from "@/store/auth";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  Linking,
  StyleSheet,
} from "react-native";

export default function ReposScreen() {
  const { githubState } = useAuthState();
  const { data: repos, isLoading, isError, error } = useRepos();

  const handleConfigureRepo = async () => {
    const url = `https://github.com/apps/gitfix-ai/installations/select_target?state=${githubState}`;
    await WebBrowser.openBrowserAsync(url);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading repositories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Repositories</Text>
      <Button title="Configure Github Repo" onPress={handleConfigureRepo} />
      <FlatList
        data={repos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.repoContainer}>
            <Text
              style={styles.repoName}
              onPress={() => Linking.openURL(item.html_url)}
            >
              {item.full_name}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  repoContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  repoName: { fontSize: 16, color: "blue" },
});
