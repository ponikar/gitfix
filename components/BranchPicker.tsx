import { useBranches } from "@/lib/useBranches";
import { useInstallationState } from "@/store/installation";
import { ContextMenu, Host, Picker } from "@expo/ui/swift-ui";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

type BranchPickerProps = {
  owner: string;
  repo: string;
};

export function BranchPicker({ owner, repo }: BranchPickerProps) {
  const { installationId } = useInstallationState();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const {
    data: branches,
    isLoading,
    isError,
    error,
  } = useBranches({
    owner,
    repo,
    installationId,
  });

  const defaultBranch = useMemo(() => {
    if (!branches) return null;
    const mainBranch = branches.find((branch) => branch.name === "main");
    if (mainBranch) return mainBranch.name;
    const masterBranch = branches.find((branch) => branch.name === "master");
    if (masterBranch) return masterBranch.name;
    return branches[0]?.name ?? null;
  }, [branches]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>;
  }

  const branchNames = branches?.map((branch) => branch.name) ?? [];
  const selectedIndex = selectedBranch
    ? branchNames.indexOf(selectedBranch)
    : defaultBranch
      ? branchNames.indexOf(defaultBranch)
      : 0;

  const currentBranch = selectedBranch ?? defaultBranch;

  return (
    <Host>
      <ContextMenu>
        <ContextMenu.Items>
          <Picker
            label="Branches"
            options={branchNames}
            variant="menu"
            selectedIndex={selectedIndex}
            onOptionSelected={({ nativeEvent: { index } }) => {
              setSelectedBranch(branchNames[index]);
            }}
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Pressable className="ml-auto flex flex-row items-center gap-1 px-1">
            <MaterialCommunityIcons
              name="source-branch"
              size={18}
              color="black"
            />
            <Text className="font-bold text-base"> {currentBranch}</Text>
            <Entypo name="chevron-down" size={18} color="black" />
          </Pressable>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
