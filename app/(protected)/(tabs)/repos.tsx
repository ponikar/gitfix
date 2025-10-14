import { useRepos } from "@/lib/useRepos";
import { useAuthState } from "@/store/auth";
import {
  useInstallationActions,
  useInstallationState,
} from "@/store/installation";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReposScreen() {
  const { githubState, accessToken } = useAuthState();
  const { installationId } = useInstallationState();
  const { setInstallationId } = useInstallationActions();
  const { data: repos, isLoading, isError, error } = useRepos(installationId);

  useEffect(() => {
    const fetchInstallationId = async () => {
      if (!accessToken) return;
      try {
        const instRes = await fetch(
          "https://api.github.com/user/installations",
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
        if (!instRes.ok) {
          throw new Error("Failed to fetch installations");
        }
        const instData = await instRes.json();
        const installation = instData.installations.find(
          (inst: any) =>
            inst.app_id.toString() === process.env.EXPO_PUBLIC_APP_ID
        );
        if (installation) {
          setInstallationId(installation.id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (!installationId) {
      fetchInstallationId();
    }
  }, [accessToken, installationId, setInstallationId]);

  const handleConfigureRepo = async () => {
    const url = `https://github.com/apps/gitfix-ai/installations/select_target?state=${githubState}`;
    await WebBrowser.openBrowserAsync(url);
  };

  console.log("repos", repos?.length);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading repositories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-red-600">
      <Text className="text-5xl">Your Repositories</Text>
      <Button title="Configure Github Repo" onPress={handleConfigureRepo} />
      <FlatList
        data={repos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/chat",
              params: {
                owner: item.full_name.split("/")[0],
                repo: item.full_name.split("/")[1],
              },
            }}
            asChild
          >
            <TouchableOpacity style={styles.repoItem}>
              <Text style={styles.repoName}>{item.full_name}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 16,
  },
  repoItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  repoName: {
    fontSize: 16,
  },
});
