import { type Message } from "@ai-sdk/react";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import { FlatList, Text, View } from "react-native";

export interface SimpleChatProps {
  messages: Message[];
}

const ToolInvocationContent = ({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation;
}) => {
  console.log("toolInvocation", toolInvocation);

  if (toolInvocation.toolName === "downloadFileContent") {
    if (toolInvocation.state === "result") {
      try {
        const { fileContents = [], response } = toolInvocation.result as {
          fileContents: { path: string; content: string }[];
          response: string;
        };

        return (
          <View className="gap-y-1">
            {fileContents.map((result, resultIndex) => (
              <>
                <View
                  key={`${toolInvocation.toolCallId}-${resultIndex}`}
                  className="flex-row items-center"
                >
                  <Text className="text-black mb-2 font-bold dark:text-white">
                    Reading file{fileContents.length > 1 ? "s" : ""}{" "}
                  </Text>
                </View>
                <Text className="font-medium">📄 {result.path}</Text>
              </>
            ))}

            {response ? (
              <Text className="text-base text-left font-medium">
                {response}
              </Text>
            ) : null}
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
