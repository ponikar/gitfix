import { useBranches } from "@/lib/useBranches";
import { useTree } from "@/lib/useTree";
import { useInstallationState } from "@/store/installation";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const { installationId } = useInstallationState();
  const {
    data: branches,
    isLoading,
    isError,
    error,
  } = useBranches({
    owner: owner!,
    repo: repo!,
    installationId,
  });
  console.log("branches", branches);

  const defaultBranch = useMemo(() => {
    if (!branches) return null;
    const mainBranch = branches.find((branch) => branch.name === "main");
    if (mainBranch) return mainBranch.name;
    const masterBranch = branches.find((branch) => branch.name === "master");
    if (masterBranch) return masterBranch.name;
    return null;
  }, [branches]);

  const { data } = useTree({
    owner: owner!,
    repo: repo!,
    branch: defaultBranch!,
    installationId,
  });

  console.log("branch", branches);
  console.log("treee", data);

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <ActivityIndicator size="large" />
        <Text>Loading branches...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1 }}>
        <View>
          <Text>Error</Text>
          <Text>{error?.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text className="text-2xl">
        Branches for {owner}/{repo}
      </Text>
      <FlatList
        data={branches ?? []}
        keyExtractor={(item) => item.commit.sha}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 2,
              borderBottomWidth: 1,
              borderBottomColor: "gray",
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
