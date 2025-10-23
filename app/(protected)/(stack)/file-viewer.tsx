import { Change, diffLines } from "diff";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export default function FileViewerScreen() {
  const { fileName, newContent, originalContent } = useLocalSearchParams<{
    fileName: string;
    newContent: string;
    originalContent: string;
  }>();

  const diff = diffLines(originalContent || "", newContent || "");

  const renderLine = (
    line: string,
    index: number,
    type: "added" | "removed" | "unchanged"
  ) => {
    let bgColor = "bg-transparent";
    let prefixChar = " ";
    let prefixColor = "text-gray-400";

    if (type === "added") {
      bgColor = "bg-green-100";
      prefixChar = "+";
      prefixColor = "text-green-600";
    } else if (type === "removed") {
      bgColor = "bg-red-100";
      prefixChar = "-";
      prefixColor = "text-red-600";
    }

    return (
      <View key={index} className={`flex-row ${bgColor}`}>
        <Text className={`${prefixColor} text-right pr-2 font-mono text-xs`}>
          {prefixChar}
        </Text>
        <Text className="text-black font-mono text-base flex-1">{line}</Text>
      </View>
    );
  };

  const renderDiff = () => {
    const lines: JSX.Element[] = [];
    let lineIndex = 0;

    diff.forEach((part: Change) => {
      const partLines = part.value.split("\n");
      // Remove last empty line if exists
      if (partLines[partLines.length - 1] === "") {
        partLines.pop();
      }

      partLines.forEach((line) => {
        if (part.added) {
          lines.push(renderLine(line, lineIndex++, "added"));
        } else if (part.removed) {
          lines.push(renderLine(line, lineIndex++, "removed"));
        } else {
          lines.push(renderLine(line, lineIndex++, "unchanged"));
        }
      });
    });

    return lines;
  };

  return (
    <ScrollView className="flex-1">
      <View className="bg-gray-100 rounded-lg">
        <Text className="font-bold px-4 text-black my-3">{fileName}</Text>
        <View className="bg-white rounded p-2">{renderDiff()}</View>
      </View>
    </ScrollView>
  );
}
