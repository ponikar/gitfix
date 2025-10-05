import { Text, View } from "@/components/Themed";
import { useAuthState } from "@/store/auth";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import { Button, FlatList, Linking, StyleSheet } from "react-native";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export default function ReposScreen() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const { accessToken: token, githubState } = useAuthState();

  const fetchInstallations = useCallback(async () => {
    if (!token) return;

    try {
      // 1️⃣ Fetch user installations
      const instRes = await fetch("https://api.github.com/user/installations", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      const instData = await instRes.json();

      console.log("instData", instData);
      const installationId = instData.installations?.[0]?.id;
      if (!installationId) return;

      // // 2️⃣ Fetch repos from your backend using installationId
      // const reposRes = await fetch(
      //   `https://your-backend.com/repos/${installationId}`
      // );
      // const reposData = await reposRes.json();
      // setRepos(reposData);
    } catch (err) {
      console.error("Error fetching installations or repos:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchInstallations();
  }, [fetchInstallations]);

  const handleConfigureRepo = async () => {
    const url = `https://github.com/apps/gitfix-ai/installations/select_target?state=${githubState}`;
    await WebBrowser.openBrowserAsync(url);
    fetchInstallations(); // refresh after user installs
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
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  repoContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  repoName: { fontSize: 16, color: "blue" },
});
