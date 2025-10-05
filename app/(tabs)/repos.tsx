import { Text, View } from "@/components/Themed";
import { useRepos } from "@/lib/useRepos";
import { useAuthState } from "@/store/auth";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { ActivityIndicator, Button, FlatList, Linking } from "react-native";

export default function ReposScreen() {
  const { githubState } = useAuthState();
  const { data: repos, isLoading, isError, error } = useRepos();

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
          <View className="p-2 border-b border-gray-300">
            <Text
              className="text-base text-blue-500"
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
