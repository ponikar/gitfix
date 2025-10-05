import { useRepos } from "@/lib/useRepos";
import { useAuthState } from "@/store/auth";
import { useInstallationActions, useInstallationState } from "@/store/installation";
import * as WebBrowser from "expo-web-browser";
import { Link } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { VStack, Text, Button } from "@expo/ui/swift-ui";

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

  if (isLoading) {
    return (
      <VStack style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading repositories...</Text>
      </VStack>
    );
  }

  if (isError) {
    return (
      <VStack style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>Error</Text>
        <Text>{error?.message}</Text>
      </VStack>
    );
  }

  return (
    <VStack style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 5 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>Your Repositories</Text>
      <Button onPress={handleConfigureRepo}>Configure Github Repo</Button>
      <FlatList
        data={repos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/(tabs)/chat",
              params: { owner: item.full_name.split("/")[0], repo: item.full_name.split("/")[1] },
            }}
            asChild
          >
            <VStack style={{ padding: 2, borderBottomWidth: 1, borderBottomColor: "gray" }}>
              <Text style={{ fontSize: 16, color: "blue" }}>{item.full_name}</Text>
            </VStack>
          </Link>
        )}
      />
    </VStack>
  );
}
