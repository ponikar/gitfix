import { type Message } from "@ai-sdk/react";
import { FlatList, Text, View } from "react-native";

export interface SimpleChatProps {
  messages: Message[];
}

export function SimpleChat({ messages }: SimpleChatProps) {
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        className={`p-3 rounded-lg my-1 max-w-[80%] ${
          isUser ? "bg-blue-500 self-end" : "bg-gray-200 self-start"
        }`}
      >
        <Text className={isUser ? "text-white" : "text-black"}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      className="flex-1"
      contentContainerClassName="p-2"
    />
  );
}
