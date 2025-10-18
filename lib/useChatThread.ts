import { useChanges } from "@/components/ActiveChangesProvider";
import { getItem } from "@/storage";
import { Storage } from "@/storage/keys";
import { useFileRefsActions } from "@/store/fileRefs";
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
}

export function useChatThread({
  threadId,
  owner,
  repo,
  installationId,
}: UseChatThreadParams) {
  const { setActiveChanges, getActiveChanges } = useChanges();
  const { getThread, addMessage } = useThreadActions();
  const { getFileRefs } = useFileRefsActions();

  const thread = useMemo(() => getThread(threadId), [threadId, getThread]);

  console.log("filesRefs", getFileRefs(threadId));

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
      files: getFileRefs(threadId),
      activeChanges: getActiveChanges(threadId),
    },
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    onFinish(message) {
      if (message.role === "user") return;

      addMessage(threadId, message);

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
                setActiveChanges(threadId, activeChanges);
              }
            }
          }
        }
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
