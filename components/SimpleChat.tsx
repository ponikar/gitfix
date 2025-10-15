import { useRaisePR } from "@/lib/useRaisePR";
import { type Message } from "@ai-sdk/react";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { structuredPatch } from "diff";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

export interface SimpleChatProps {
  messages: Message[];
  owner: string;
  repo: string;
  base: string;
  installationId: number;
}

interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

interface DiffViewProps {
  path: string;
  originalContent: string;
  newContent: string;
}

export const DiffView = ({
  path,
  originalContent,
  newContent,
}: DiffViewProps) => {
  const patch = structuredPatch(
    path,
    path,
    originalContent,
    newContent,
    "",
    "",
    {
      context: 3,
    }
  );

  const renderHunk = (hunk: Hunk, index: number) => {
    return (
      <View key={index} className="mt-2">
        <Text className="text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-slate-600 px-2 py-1 font-mono">
          {`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`}
        </Text>
        {hunk.lines.map((line, lineIndex) => {
          const prefix = line[0];
          const content = line.slice(1);
          let lineStyle = "bg-transparent";
          let prefixChar = " ";
          if (prefix === "+") {
            lineStyle = "bg-green-100 dark:bg-green-900";
            prefixChar = "+";
          } else if (prefix === "-") {
            lineStyle = "bg-red-100 dark:bg-red-900";
            prefixChar = "-";
          }
          return (
            <View key={lineIndex} className={`flex-col ${lineStyle}`}>
              <Text className="text-gray-500 dark:text-gray-400 w-8 text-right pr-2 font-mono">
                {prefixChar}
              </Text>
              <Text className="text-black dark:text-white font-mono">
                {content}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View className="mt-2 p-2 bg-gray-100 dark:bg-slate-700 rounded-md">
      <Text className="font-bold text-black dark:text-white">{path}</Text>
      {patch.hunks.map(renderHunk)}
    </View>
  );
};

const ToolInvocationContent = ({
  toolInvocation,
  owner,
  repo,
  base,
  installationId,
  messages,
}: {
  toolInvocation: ToolInvocation;
  owner: string;
  repo: string;
  base: string;
  installationId: number;
  messages: Message[];
}) => {
  const { mutate: raisePR, isPending, isSuccess, data } = useRaisePR();

  if (toolInvocation.toolName === "downloadFileContent") {
    if (toolInvocation.state === "result") {
      try {
        const { fileContents, response } = toolInvocation.result as {
          fileContents: { path: string; content: string }[];
          response:
            | {
                type: "TEXT_RESPONSE";
                response: string;
              }
            | {
                type: "GIT_DIFF";
                files: {
                  path: string;
                  originalContent: string;
                  newContent: string;
                }[];
              };
        };

        const handleRaisePR = () => {
          if (response.type !== "GIT_DIFF") return;

          const head = `gitfix/patch-${Date.now()}`;
          const files = response.files.map((f) => ({
            path: f.path,
            content: f.newContent,
          }));

          raisePR({
            owner,
            repo,
            base,
            head,
            files,
            installationId,
            messages,
          });
        };

        const redirectToGithub = (url: string) => {
          Linking.openURL(url);
        };

        const readingFilesView = (
          <View className="gap-y-1">
            {fileContents.map((result, resultIndex) => (
              <View key={`${toolInvocation.toolCallId}-${resultIndex}`}>
                <View className="flex-row items-center">
                  <Text className="text-black mb-2 font-bold dark:text-white">
                    Reading file{fileContents.length > 1 ? "s" : ""}{" "}
                  </Text>
                </View>
                <Text className="font-medium">📄 {result.path}</Text>
              </View>
            ))}
          </View>
        );

        let responseContent = null;
        if (response.type === "TEXT_RESPONSE") {
          responseContent = (
            <Text className="text-base text-left font-medium mt-2">
              {response.response}
            </Text>
          );
        } else if (response.type === "GIT_DIFF") {
          responseContent = (
            <View className="mt-2">
              <Text className="text-base text-left font-medium">
                Proposed changes:
              </Text>
              {response.files.map((file, index) => (
                <DiffView
                  key={index}
                  path={file.path}
                  originalContent={file.originalContent}
                  newContent={file.newContent}
                />
              ))}
              {isSuccess && data ? (
                <View className="mt-4 flex items-center gap-4 flex-row">
                  <Pressable
                    onPress={() => redirectToGithub(data.pullRequestUrl)}
                    disabled={isPending}
                    className="bg-white flex flex-row gap-2 items-center rounded-md p-2"
                  >
                    <AntDesign name="github" size={20} color="black" />
                    <Text className="text-black font-bold">View on Github</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handleRaisePR}
                  disabled={isPending}
                  className="bg-blue-500 rounded-md p-2 mt-4 self-start"
                >
                  {isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Raise PR</Text>
                  )}
                </Pressable>
              )}
            </View>
          );
        }

        return (
          <View>
            {readingFilesView}
            {responseContent}
          </View>
        );
      } catch (e) {
        console.error("Error parsing tool result", e);
        return null;
      }
    }
  }
  return null;
};

export function SimpleChat({
  messages,
  owner,
  repo,
  base,
  installationId,
}: SimpleChatProps) {
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    const toolInvocations = item.parts
      ?.filter((part) => part.type === "tool-invocation")
      .map((part) =>
        part.type === "tool-invocation" ? part.toolInvocation : null
      )
      .filter((p) => p !== null);

    return (
      <View
        className={`p-3 rounded-lg my-1 max-w-[80%] ${
          isUser
            ? "bg-blue-500 self-end"
            : "bg-gray-200 dark:bg-slate-800 self-start"
        }`}
      >
        {item.content ? (
          <Text
            className={isUser ? "text-white" : "text-black dark:text-white"}
          >
            {item.content}
          </Text>
        ) : null}
        {toolInvocations && toolInvocations.length > 0 ? (
          <View className="mt-2 flex gap-y-2">
            {toolInvocations.map((toolInvocation, index) => (
              <ToolInvocationContent
                key={`${toolInvocation.toolCallId}-${index}`}
                toolInvocation={toolInvocation}
                owner={owner}
                repo={repo}
                base={base}
                installationId={installationId}
                messages={messages}
              />
            ))}
          </View>
        ) : null}
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
