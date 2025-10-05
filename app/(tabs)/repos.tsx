import { Text, View } from "@/components/Themed";
import { useRepos } from "@/lib/useRepos";
import { useAuthActions, useAuthState } from "@/store/auth";
import {
  useInstallationActions,
  useInstallationState,
} from "@/store/installation";
import * as WebBrowser from "expo-web-browser";
import { Link } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Button, FlatList } from "react-native";

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
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
        <Text className="text-black dark:text-white">Loading repositories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-2xl font-bold mb-5 text-black dark:text-white">Error</Text>
        <Text className="text-black dark:text-white">{error?.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center pt-5 bg-white dark:bg-black">
      <Text className="text-2xl font-bold mb-5 text-black dark:text-white">Your Repositories</Text>
      <Button title="Configure Github Repo" onPress={handleConfigureRepo} />
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
            <View className="p-2 border-b border-gray-300">
              <Text className="text-base text-blue-500">{item.full_name}</Text>
            </View>
          </Link>
        )}
      />
    </View>
  );
}
