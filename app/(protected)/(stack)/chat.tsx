import { ChatInput } from "@/components/ChatInput";
import { FileList } from "@/components/FileList";
import { useBranches } from "@/lib/useBranches";
import { useInstallationState } from "@/store/installation";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const fileRefs = useRef<string[]>([]);

  const { installationId } = useInstallationState();
  const { data: branches } = useBranches({
    owner: owner!,
    repo: repo!,
    installationId,
  });

  const defaultBranch = useMemo(() => {
    if (!branches) return "main";
    const mainBranch = branches.find((b) => b.name === "main");
    if (mainBranch) return mainBranch.name;
    const masterBranch = branches.find((b) => b.name === "master");
    if (masterBranch) return masterBranch.name;
    return branches[0]?.name ?? "main";
  }, [branches]);

  const handleTextChange = (text: string) => {
    // Sync file refs by checking which are still present in the text
    fileRefs.current = fileRefs.current.filter((filePath) =>
      text.includes(`@${filePath}`)
    );

    setPrompt(text);
    const trigger = " @";
    const triggerIndex = text.lastIndexOf(trigger);

    if (triggerIndex !== -1) {
      const potentialQuery = text.substring(triggerIndex + trigger.length);
      if (!potentialQuery.includes(" ")) {
        setSearchQuery(potentialQuery);
        return;
      }
    }
    setSearchQuery(null);
  };

  const handleFileSelect = (filePath: string) => {
    const atIndex = prompt.lastIndexOf("@");
    const newPrompt = prompt.substring(0, atIndex + 1) + filePath + " ";
    setPrompt(newPrompt);
    setSearchQuery(null);

    // Add the selected file to the ref if it's not already there
    if (!fileRefs.current.includes(filePath)) {
      fileRefs.current.push(filePath);
    }
  };

  const handleSend = () => {
    console.log("Sending prompt:", prompt);
    console.log("With file references:", fileRefs.current);

    // Reset state after sending
    setPrompt("");
    setSearchQuery(null);
    fileRefs.current = [];
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={60}
      behavior="height"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1" />
        <ChatInput.Container>
          {searchQuery !== null && (
            <FileList
              owner={owner!}
              repo={repo!}
              branch={defaultBranch}
              searchQuery={searchQuery}
              onFileSelect={handleFileSelect}
            />
          )}
          <View className="flex flex-row items-start">
            <ChatInput.Input
              placeholder="Type @ to mention a file..."
              value={prompt}
              onChangeText={handleTextChange}
            />
            <ChatInput.Button onPress={handleSend}>
              <AntDesign name="arrow-up" size={16} color="white" />
            </ChatInput.Button>
          </View>
          <ChatInput.BranchPicker owner={owner!} repo={repo!} />
        </ChatInput.Container>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
