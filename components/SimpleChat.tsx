import { useRaisePR } from "@/lib/useRaisePR";
import { type Message } from "@ai-sdk/react";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { structuredPatch } from "diff";
import { useEffect } from "react";
import { FlatList, Linking, Text, View } from "react-native";
import { useChanges } from "../components/ActiveChangesProvider";
import { Button, ButtonIcon, ButtonText } from "./Button";

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

type ToolResult =
  | {
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
    }
  | {
      error: string;
    };

const ReadingFilesList = ({
  files,
  toolCallId,
}: {
  files: { path: string; content: string }[];
  toolCallId: string;
}) => {
  if (!Array.isArray(files) || files.length === 0) return null;

  return (
    <View className="gap-y-1">
      <View className="flex-row items-center">
        <Text className="text-black mb-2 font-bold dark:text-white">
          Reading file{files.length > 1 ? "s" : ""}
        </Text>
      </View>
      {files.map((file, index) => (
        <Text key={`${toolCallId}-${index}`} className="font-medium">
          📄 {file.path}
        </Text>
      ))}
    </View>
  );
};

const TextResponse = ({ text }: { text: string }) => (
  <Text className="text-base text-left font-medium mt-2">{text}</Text>
);

const GitDiffResponse = ({
  files,
  prExists,
  isPending,
  onRaisePR,
  onViewOnGithub,
}: {
  files: {
    path: string;
    originalContent: string;
    newContent: string;
  }[];
  prExists: string | undefined;
  isPending: boolean;
  onRaisePR: () => void;
  onViewOnGithub: (url: string) => void;
}) => (
  <View className="mt-2">
    <Text className="text-base text-left font-medium">Proposed changes:</Text>
    {files.map((file, index) => (
      <DiffView
        key={index}
        path={file.path}
        originalContent={file.originalContent}
        newContent={file.newContent}
      />
    ))}
    {prExists ? (
      <View className="mt-4 ml-auto flex items-center gap-4 flex-row">
        <Button
          variant="secondary"
          size="md"
          onPress={() => onViewOnGithub(prExists)}
        >
          <ButtonIcon>
            <AntDesign name="github" size={20} color="black" />
          </ButtonIcon>
          <ButtonText>View on Github</ButtonText>
        </Button>
      </View>
    ) : (
      <Button
        variant="primary"
        size="md"
        isLoading={isPending}
        onPress={onRaisePR}
        className="mt-4"
      >
        <ButtonIcon>
          <AntDesign name="pull-request" color="white" />
        </ButtonIcon>
        {!isPending && <ButtonText>Raise PR</ButtonText>}
      </Button>
    )}
  </View>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <Text className="text-black">{error}</Text>
);

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
  const { state: changesState, setPrLink } = useChanges();
  const { mutate: raisePR, isPending, data } = useRaisePR();

  useEffect(() => {
    if (data?.pullRequestUrl) {
      setPrLink(toolInvocation.toolCallId, data.pullRequestUrl);
    }
  }, [data, toolInvocation.toolCallId, setPrLink]);

  if (
    toolInvocation.toolName !== "downloadFileContent" ||
    toolInvocation.state !== "result"
  ) {
    return null;
  }

  const existingPrLink = changesState.prLinks.get(toolInvocation.toolCallId);
  const prExists = data?.pullRequestUrl || existingPrLink;

  try {
    const toolResult = toolInvocation.result as ToolResult;

    if ("error" in toolResult) {
      return <ErrorMessage error={toolResult.error} />;
    }

    const { fileContents, response } = toolResult;

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

    const handleViewOnGithub = (url: string) => {
      Linking.openURL(url);
    };

    return (
      <View>
        <ReadingFilesList
          files={fileContents}
          toolCallId={toolInvocation.toolCallId}
        />
        {response.type === "TEXT_RESPONSE" && (
          <TextResponse text={response.response} />
        )}
        {response.type === "GIT_DIFF" && (
          <GitDiffResponse
            files={response.files}
            prExists={prExists}
            isPending={isPending}
            onRaisePR={handleRaisePR}
            onViewOnGithub={handleViewOnGithub}
          />
        )}
      </View>
    );
  } catch (error) {
    console.error("Error parsing tool result:", error);
    return (
      <ErrorMessage error="Failed to parse tool result. Please try again." />
    );
  }
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
        className={`p-3 rounded-2xl my-2 ${
          isUser
            ? "bg-slate-800 self-end max-w-[80%]"
            : "border bg-white border-gray-200 dark:bg-slate-800 self-start"
        }`}
      >
        {item.content ? (
          <Text
            className={isUser ? "text-white" : "text-black dark:text-white"}
          >
            {item.content?.trim()}
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
