import { useThreadState } from "@/store/threads";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Link } from "expo-router";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function ThreadsScreen() {
  const { threads } = useThreadState();

  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  if (threads.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">
          No threads yet. Start a conversation!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={sortedThreads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lastMessage = item.messages[item.messages.length - 1];
          const lastMessageText = lastMessage?.content || "No messages yet";

          return (
            <Link
              href={{
                pathname: "/chat",
                params: {
                  owner: item.owner,
                  repo: item.repo,
                  threadId: item.id,
                },
              }}
              asChild
            >
              <TouchableOpacity className="bg-white border-b border-gray-200 p-4">
                <View className="flex flex-row items-center gap-2 mb-1">
                  <AntDesign name="github" size={18} color="gray" />
                  <Text className="text-sm font-semibold text-gray-700">
                    {item.owner}/{item.repo}
                  </Text>
                </View>
                {/* <Text
                  className="text-base font-medium text-black mb-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text> */}
                <Text className="text-sm text-gray-600" numberOfLines={1}>
                  {lastMessageText}
                </Text>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}
