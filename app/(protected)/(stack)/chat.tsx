import { ChatInput } from "@/components/ChatInput";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- ChatScreen ---

export default function ChatScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    console.log("Prompt:", prompt);
    setPrompt("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1" />

      <ChatInput.Container>
        <View className="flex flex-row">
          <ChatInput.Input
            placeholder="Enter your prompt..."
            value={prompt}
            onChangeText={setPrompt}
          />
          <ChatInput.Button onPress={handleSend}>
            <AntDesign name="arrow-up" size={16} color="white" />
          </ChatInput.Button>
        </View>
        <ChatInput.BranchPicker owner={owner!} repo={repo!} />
      </ChatInput.Container>
    </SafeAreaView>
  );
}
