import { BranchPicker } from "@/components/BranchPicker";
import { ChatInput } from "@/components/ChatInput";
import { FileList } from "@/components/FileList";
import { useFileRefsActions, useFileRefsState } from "@/store/fileRefs";
import AntDesign from "@expo/vector-icons/AntDesign";
import { GlassView } from "expo-glass-effect";
import React, { memo, useState } from "react";
import { View } from "react-native";

interface ChatInputSectionProps {
  owner: string;
  repo: string;
  branch: string;
  onSend: (message: string) => void;
  onBranchChange: (branch: string) => void;

  initialConvo: boolean;
}

export const ChatInputSection = memo(function ChatInputSection({
  owner,
  repo,
  branch,
  onSend,
  onBranchChange,
  initialConvo = false,
}: ChatInputSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const { fileRefs } = useFileRefsState();
  const { setFileRefs } = useFileRefsActions();

  const handleTextChange = (text: string) => {
    setPrompt(text);
    const trigger = text.length === 1 ? "@" : " @";
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

  const handleFileSelect = (filePath: { path: string; sha: string }) => {
    const atIndex = prompt.lastIndexOf("@");
    const newPrompt = prompt.substring(0, atIndex + 1) + filePath.path + " ";
    setPrompt(newPrompt);
    setSearchQuery(null);

    const isDuplicate = fileRefs.some((ref) => ref.path === filePath.path);
    if (!isDuplicate) {
      setFileRefs([...fileRefs, filePath]);
    }
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    onSend(prompt);
    setPrompt("");
    setSearchQuery(null);
  };

  return (
    <ChatInput.Container>
      <GlassView
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
        }}
      />
      {searchQuery !== null && (
        <FileList
          owner={owner}
          repo={repo}
          branch={branch}
          searchQuery={searchQuery}
          onFileSelect={handleFileSelect}
        />
      )}

      <View className="flex overflow-hidden flex-row items-start">
        <ChatInput.Input
          placeholder="Type @ to mention a file..."
          value={prompt}
          onChangeText={handleTextChange}
        />

        <ChatInput.Button onPress={handleSend}>
          <AntDesign name="arrow-up" size={16} color="white" />
        </ChatInput.Button>
      </View>

      {initialConvo && (
        <BranchPicker
          owner={owner}
          repo={repo}
          branch={branch}
          onBranchChange={onBranchChange}
        />
      )}
    </ChatInput.Container>
  );
});
