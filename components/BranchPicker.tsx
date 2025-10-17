import { useBranches } from "@/lib/useBranches";
import { useInstallationState } from "@/store/installation";
import { Button, ContextMenu, Host } from "@expo/ui/swift-ui";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

type BranchPickerProps = {
  owner: string;
  repo: string;
  branch: string;
  onBranchChange: (branch: string) => void;
};

export function BranchPicker({
  owner,
  repo,
  branch,
  onBranchChange,
}: BranchPickerProps) {
  const { installationId } = useInstallationState();

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

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isError) {
    return <Text>Error: {error?.message}</Text>;
  }

  const branchNames = branches?.map((b) => b.name) ?? [];
  const selectedIndex = branchNames.indexOf(branch);

  return (
    <Host>
      <ContextMenu>
        <ContextMenu.Items>
          {branchNames.map((b, index) => (
            <Button
              variant="glass"
              systemImage={branch === b ? "checkmark" : undefined}
              onPress={() => onBranchChange(branchNames[index])}
            >
              {b}
            </Button>
          ))}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Pressable className="ml-auto flex flex-row items-center gap-1 px-1">
            <MaterialCommunityIcons
              name="source-branch"
              size={18}
              color="black"
            />
            <Text className="font-bold text-base"> {branch}</Text>
            <Entypo name="chevron-down" size={18} color="black" />
          </Pressable>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
