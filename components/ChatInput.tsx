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
};

const ChatInputContainer = ({ children }: ChatInputContainerProps) => {
  return (
    <View className="m-3 bg-white border border-gray-200 rounded-2xl dark:bg-slate-800 gap-2 p-2.5">
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
      className="flex-1 px-2 bg-transparent dark:bg-gray-700 text-black dark:text-white"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#000"
    />
  );
};

const ChatInputButton = ({ onPress, children }: ChatInputButtonProps) => {
  return (
    <Pressable onPress={onPress} className="bg-slate-800 rounded-full p-2">
      {children}
    </Pressable>
  );
};

const BranchPicker = ({ owner, repo }: BranchPickerProps) => {
  return <BranchPickerComponent owner={owner} repo={repo} />;
};

export const ChatInput = {
  Container: ChatInputContainer,
  Input: ChatInputInput,
  Button: ChatInputButton,
  BranchPicker: BranchPicker,
};
