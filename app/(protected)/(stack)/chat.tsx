import { useBranches } from "@/lib/useBranches";
import { useTree } from "@/lib/useTree";
import { useInstallationState } from "@/store/installation";
import { Button, ContextMenu, Host, Picker } from "@expo/ui/swift-ui";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
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
      <Host style={{ width: 150, height: 50 }}>
        <ContextMenu>
          <ContextMenu.Items>
            <Button
              systemImage="person.crop.circle.badge.xmark"
              onPress={() => console.log("Pressed1")}
            >
              Hello
            </Button>
            <Button
              variant="bordered"
              systemImage="heart"
              onPress={() => console.log("Pressed2")}
            >
              Love it
            </Button>
            <Picker
              label="Doggos"
              options={["very", "veery", "veeery", "much"]}
              variant="menu"
              selectedIndex={0}
              onOptionSelected={({ nativeEvent: { index } }) => {}}
            />
          </ContextMenu.Items>
          <ContextMenu.Trigger>
            <Button variant="bordered">Show Menu</Button>
          </ContextMenu.Trigger>
        </ContextMenu>
      </Host>
    </SafeAreaView>
  );
}
