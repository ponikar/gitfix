import { View } from "@/components/Themed";
import { useGitHubAuth } from "@/components/useGitHubAuth";
import AntDesign from "@expo/vector-icons/AntDesign";
import { cssInterop } from "nativewind";
import { Image, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(SafeAreaView, {
  className: "style",
});

export default function TabOneScreen() {
  const { login } = useGitHubAuth();

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#0e0e0e] px-4">
      <View className="flex-1 items-center justify-center">
        <View className="flex-1 items-center justify-center">
          <View className="flex items-center justify-center">
            <Image
              source={require("../../assets/images/icon.png")}
              className="w-[100px] h-[100px] object-contain"
            />
            <Text className="text-center text-gray-200 font-medium text-3xl">
              GitFix
            </Text>
            <Text className="text-center text-gray-200 font-medium text-base">
              Ship code directly from your iPhone.
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={login}
        className="bg-white flex-row gap-2.5 flex items-center justify-center rounded-full p-3.5"
      >
        <AntDesign size={18} name="github" color="black" />

        <Text className="font-medium text-lg text-black">
          Continue with Github
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
