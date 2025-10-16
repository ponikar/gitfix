import { ChatInput } from "@/components/ChatInput";
import { FileList } from "@/components/FileList";
import { SimpleChat } from "@/components/SimpleChat";
import { API_URL } from "@/lib/api";
import { useBranches } from "@/lib/useBranches";
import { useInstallationState } from "@/store/installation";
import { useChat } from "@ai-sdk/react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { fetch as expoFetch } from "expo/fetch";

import { useChanges } from "@/components/ActiveChangesProvider";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { owner, repo } = useLocalSearchParams<{
    owner: string;
    repo: string;
  }>();
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [fileRefs, setFileRefs] = useState<
    {
      path: string;
      sha: string;
    }[]
  >([]);

  const { installationId } = useInstallationState();
  const { state, setActiveChanges } = useChanges();
  const { activeChanges } = state;

  const { messages, append, isLoading } = useChat({
    api: `${API_URL}/api/suggest-fix`,
    headers: {
      "Content-Type": "application/json",
      "x-installation-id": installationId?.toString() || "",
      // Authorization: `Bearer ${session?.provider_token}`,
    },
    body: {
      owner,
      repo,
      files: fileRefs,
      userPrompt: prompt,
      activeChanges: activeChanges,
    },
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    onFinish(message) {
      console.log("AI response finished:", message);
      const toolInvocations = message.parts?.filter(
        (part) => part.type === "tool-invocation"
      );
      if (toolInvocations && toolInvocations.length > 0) {
        for (const part of toolInvocations) {
          if (part.type === "tool-invocation") {
            const toolInvocation = part.toolInvocation;
            if (
              toolInvocation.toolName === "downloadFileContent" &&
              toolInvocation.state === "result"
            ) {
              const result = toolInvocation.result as {
                response: {
                  type: string;
                  files?: Array<{ path: string; newContent: string }>;
                };
              };
              if (
                result.response?.type === "GIT_DIFF" &&
                result.response.files
              ) {
                const activeChanges: { [filePath: string]: string } = {};
                result.response.files.forEach((file) => {
                  activeChanges[file.path] = file.newContent;
                });
                setActiveChanges(activeChanges);
              }
            }
          }
        }
      }
    },
  });

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
    setFileRefs(
      fileRefs.filter((filePath) => text.includes(`@${filePath.path}`))
    );

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

    setFileRefs((f) => [...f, filePath]);
  };

  const handleSend = () => {
    console.log("Sending prompt:", prompt);

    append({ role: "user", content: prompt });

    setPrompt("");
    setSearchQuery(null);
    setFileRefs([]);
  };

  console.log("searchQuery", searchQuery);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        keyboardVerticalOffset={60}
        behavior="height"
      >
        <SimpleChat
          messages={messages}
          owner={owner!}
          repo={repo!}
          base={defaultBranch}
          installationId={installationId!}
        />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
