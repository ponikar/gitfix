import { Text, View } from "@/components/Themed";
import { useAuthState } from "@/store/auth";
import React, { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Linking, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export default function ReposScreen() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const { accessToken: token, githubState } = useAuthState();

  const fetchRepos = useCallback(async () => {
    if (token) {
      try {
        const response = await fetch("https://api.github.com/user/repos", {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error("Error fetching repos:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const handleConfigureRepo = async () => {
    const url = `https://github.com/apps/gitfix-ai/installations/select_target?state=${githubState}`;
    await WebBrowser.openBrowserAsync(url);
    fetchRepos();
  };

  return (
    <View style={styles.container}>
      {token ? (
        <>
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
        </>
      ) : (
        <View style={styles.container}>
          <Text style={styles.title}>Repository Access Required</Text>
          <Text>Please grant access to your repositories to continue.</Text>
        </View>
      )}
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  repoContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  repoName: {
    fontSize: 16,
    color: "blue",
  },
});