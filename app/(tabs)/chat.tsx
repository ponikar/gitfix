import { useBranches } from "@/lib/useBranches";
import { useTree } from "@/lib/useTree";
import { useInstallationState } from "@/store/installation";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { VStack, Text } from "@expo/ui/swift-ui";

export default function ChatScreen() {
  const { owner, repo } = useLocalSearchParams<{ owner: string; repo: string }>();
  const { installationId } = useInstallationState();
  const { data: branches, isLoading, isError, error } = useBranches({
    owner: owner!,
    repo: repo!,
    installationId,
  });

  const defaultBranch = useMemo(() => {
    if (!branches) return null;
    const mainBranch = branches.find((branch) => branch.name === "main");
    if (mainBranch) return mainBranch.name;
    const masterBranch = branches.find((branch) => branch.name === "master");
    if (masterBranch) return masterBranch.name;
    return null;
  }, [branches]);

  useTree({
    owner: owner!,
    repo: repo!,
    branch: defaultBranch!,
    installationId,
  });

  if (isLoading) {
    return (
      <VStack style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading branches...</Text>
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
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>
        Branches for {owner}/{repo}
      </Text>
      <FlatList
        data={branches}
        keyExtractor={(item) => item.commit.sha}
        renderItem={({ item }) => (
          <VStack style={{ padding: 2, borderBottomWidth: 1, borderBottomColor: "gray" }}>
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </VStack>
        )}
      />
    </VStack>
  );
}
