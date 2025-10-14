import { useRepos } from "@/lib/useRepos";
import { useAuthState } from "@/store/auth";
import {
  useInstallationActions,
  useInstallationState,
} from "@/store/installation";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text>Loading repositories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error</Text>
        <Text>{error?.message}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 dark:bg-gray-900 bg-white">
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
            <TouchableOpacity className="bg-gray-50 border-b border-gray-200 flex flex-row items-center gap-2 dark:bg-gray-800 rounded-lg p-3 mb-4">
              <AntDesign name="github" size={24} color="black" />
              <Text className="text-xl font-medium text-black dark:text-white">
                {item.full_name}
              </Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
