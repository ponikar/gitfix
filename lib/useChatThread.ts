import { useChanges } from "@/components/ActiveChangesProvider";
import { getItem } from "@/storage";
import { Storage } from "@/storage/keys";
import { useFileRefs } from "@/store/fileRefs";
import { useThreadActions } from "@/store/threads";
import { useChat, type Message } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useMemo, useRef } from "react";
import { API_URL } from "./api";

interface UseChatThreadParams {
  threadId: string;
  owner: string;
  repo: string;
  installationId: number;
  onFinish?: () => void;
}

export type MessageToolFiles = Array<{
  path: string;
  newContent: string;
  originalContent: string;
}>;
export type MessageToolResult = {
  fileContents?: {
    type: "GIT_DIFF";
    files: MessageToolFiles;
  };
  response?: {
    type: "TEXT_RESPONSE";
    response: string;
  };
};

export function useChatThread({
  threadId,
  owner,
  repo,
  installationId,
  onFinish: onFinishCallback,
}: UseChatThreadParams) {
  const { setActiveChanges, getActiveChanges } = useChanges();
  const { getThread, addMessage } = useThreadActions();

  const thread = useMemo(() => getThread(threadId), [threadId, getThread]);
  const fileRefs = useFileRefs(threadId);

  const jwtToken = useRef(getItem(Storage.JWT_TOKEN)).current;

  const { messages, append } = useChat({
    initialMessages: thread?.messages || [],
    api: `${API_URL}/api/suggest-fix`,
    headers: {
      "Content-Type": "application/json",
      "x-installation-id": installationId.toString(),
      ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
    },
    body: {
      owner,
      repo,
      files: fileRefs,
      activeChanges: getActiveChanges(threadId),
    },
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    onFinish(message) {
      if (message.role === "user") return;

      addMessage(threadId, message);

      const toolInvocations = message.parts?.filter(
        (part) => part.type === "tool-invocation"
      );

      // storing snapshot of new changes
      // so we can treat it as snapshot later
      if (toolInvocations && toolInvocations.length > 0) {
        for (const part of toolInvocations) {
          if (part.type === "tool-invocation") {
            const toolInvocation = part.toolInvocation;
            if (
              toolInvocation.toolName === "fetchFilesAndResolveQuery" &&
              toolInvocation.state === "result"
            ) {
              const result = toolInvocation.result as MessageToolResult;

              if (
                result.fileContents?.type === "GIT_DIFF" &&
                result.fileContents.files
              ) {
                const activeChanges: { [filePath: string]: string } = {};
                result.fileContents.files.forEach((file) => {
                  activeChanges[file.path] = file.newContent;
                });
                setActiveChanges(threadId, activeChanges);
              }
            }
          }
        }
      }

      if (onFinishCallback) {
        onFinishCallback();
      }
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: `${Date.now()}`,
        role: "user",
        content,
      };

      addMessage(threadId, userMessage);
      append(userMessage);
    },
    [threadId, addMessage, append]
  );

  return {
    thread,
    messages,
    sendMessage,
  };
}
