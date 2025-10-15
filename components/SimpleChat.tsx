import { type Message } from "@ai-sdk/react";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import { structuredPatch } from "diff";
import { FlatList, Text, View } from "react-native";

export interface SimpleChatProps {
  messages: Message[];
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
}: {
  toolInvocation: ToolInvocation;
}) => {
  console.log("toolInvocation", toolInvocation);

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

export function SimpleChat({ messages }: SimpleChatProps) {
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    console.log("tool__", item.parts);

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
