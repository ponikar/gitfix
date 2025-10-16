import { ChatInputSection } from "@/components/ChatInputSection";
import { SimpleChat } from "@/components/SimpleChat";
import { useBranches } from "@/lib/useBranches";
import { useChatThread } from "@/lib/useChatThread";
import { useInstallationState } from "@/store/installation";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const { owner, repo, threadId } = useLocalSearchParams<{
    owner: string;
    repo: string;
    threadId: string;
  }>();

  const { installationId } = useInstallationState();

  const { thread, messages, sendMessage } = useChatThread({
    threadId: threadId!,
    owner: owner!,
    repo: repo!,
    installationId: installationId!,
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

  const handleSend = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

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
          base={thread?.branch || defaultBranch}
          installationId={installationId!}
        />
        <ChatInputSection
          owner={owner!}
          repo={repo!}
          branch={thread?.branch || defaultBranch}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
