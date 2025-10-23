import { ChatInputSection } from "@/components/ChatInputSection";
import { SimpleChat } from "@/components/SimpleChat";
import { useBranches } from "@/lib/useBranches";
import { useChatThread } from "@/lib/useChatThread";
import { useInstallationState } from "@/store/installation";
import { LegendListRef } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
    onFinish: () => {
      setTimeout(() => {
        chatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  const { data: branches } = useBranches({
    owner: owner!,
    repo: repo!,
    installationId,
  });

  const [branch, setBranch] = useState<string>("main");
  const chatListRef = useRef<LegendListRef>(null);

  console.log("branch", branch);

  useEffect(() => {
    if (!branches) return;
    const mainBranch = branches.find((b) => b.name === "main");
    if (mainBranch) {
      setBranch(mainBranch.name);
      return;
    }
    const masterBranch = branches.find((b) => b.name === "master");
    if (masterBranch) {
      setBranch(masterBranch.name);
      return;
    }
    if (branches[0]?.name) {
      setBranch(branches[0].name);
    }
  }, [branches]);

  const handleSend = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
      setTimeout(() => {
        chatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage]
  );

  const handleBranchChange = useCallback((newBranch: string) => {
    setBranch(newBranch);
  }, []);

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        keyboardVerticalOffset={120}
        behavior="height"
      >
        <SimpleChat
          ref={chatListRef}
          messages={messages}
          owner={owner!}
          repo={repo!}
          base={branch}
          installationId={installationId!}
        />
        <ChatInputSection
          threadId={threadId}
          owner={owner}
          initialConvo={messages.length === 0}
          repo={repo}
          branch={branch}
          onSend={handleSend}
          onBranchChange={handleBranchChange}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
