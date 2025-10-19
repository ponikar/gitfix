import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { BranchPicker as BranchPickerComponent } from "./BranchPicker";

type ChatInputContainerProps = {
  children: React.ReactNode;
};

type ChatInputInputProps = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
};

type ChatInputButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
};

type BranchPickerProps = {
  owner: string;
  repo: string;
  branch: string;
  onBranchChange: (branch: string) => void;
};

const ChatInputContainer = ({ children }: ChatInputContainerProps) => {
  return (
    <View className="m-3 border overflow-hidden border-gray-200 rounded-2xl gap-2 p-2.5">
      {children}
    </View>
  );
};

const ChatInputInput = ({
  placeholder,
  value,
  onChangeText,
}: ChatInputInputProps) => {
  return (
    <TextInput
      className="flex-1 px-2 bg-transparent max-h-[50px] text-black"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline
      placeholderTextColor="#000"
    />
  );
};

const ChatInputButton = ({ onPress, children }: ChatInputButtonProps) => {
  return (
    <Pressable onPress={onPress} className="bg-black rounded-full p-2">
      {children}
    </Pressable>
  );
};

const BranchPicker: React.FC<BranchPickerProps> = ({
  owner,
  repo,
  branch,
  onBranchChange,
}) => {
  return (
    <BranchPickerComponent
      owner={owner}
      repo={repo}
      branch={branch}
      onBranchChange={onBranchChange}
    />
  );
};

export const ChatInput = {
  Container: ChatInputContainer,
  Input: ChatInputInput,
  Button: ChatInputButton,
  BranchPicker: BranchPicker,
};
