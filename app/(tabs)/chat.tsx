import { Text, View } from "@/components/Themed";
import { useBranches } from "@/lib/useBranches";
import { useInstallationState } from "@/store/installation";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList } from "react-native";

export default function ChatScreen() {
  const { owner, repo } = useLocalSearchParams<{ owner: string; repo: string }>();
  const { installationId } = useInstallationState();
  const { data: branches, isLoading, isError, error } = useBranches({
    owner: owner!,
    repo: repo!,
    installationId,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
        <Text className="text-black dark:text-white">Loading branches...</Text>
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
      <Text className="text-2xl font-bold mb-5 text-black dark:text-white">
        Branches for {owner}/{repo}
      </Text>
      <FlatList
        data={branches}
        keyExtractor={(item) => item.commit.sha}
        renderItem={({ item }) => (
          <View className="p-2 border-b border-gray-300">
            <Text className="text-base text-black dark:text-white">{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
