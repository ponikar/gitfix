import { TreeEntry } from "@/lib/types";
import { useTree } from "@/lib/useTree";
import { useInstallationState } from "@/store/installation";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";

type FileListProps = {
  owner: string;
  repo: string;
  branch: string;
  searchQuery: string;
  onFileSelect: (path: string) => void;
};

export function FileList({
  owner,
  repo,
  branch,
  searchQuery,
  onFileSelect,
}: FileListProps) {
  const { installationId } = useInstallationState();
  const { data, isLoading, isError, error } = useTree({
    owner,
    repo,
    branch,
    installationId,
  });

  const filteredFiles = useMemo(() => {
    if (!data) return [];
    return data.tree.filter(
      (file) =>
        file.type === "blob" &&
        file.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (isLoading) return <ActivityIndicator className="p-2.5" />;
  if (isError)
    return <Text className="p-2.5 text-red-500">Error: {error?.message}</Text>;

  const renderItem = ({ item }: { item: TreeEntry }) => (
    <TouchableOpacity
      onPress={() => onFileSelect(item.path)}
      className="flex-row items-center p-3 border-b border-gray-200"
    >
      <AntDesign name="file" size={16} color="#666" />
      <Text className="ml-2.5 text-sm text-gray-700">{item.path}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={filteredFiles}
      renderItem={renderItem}
      keyExtractor={(item) => item.path}
      className="h-[200px]"
    />
  );
}
