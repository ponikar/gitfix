import { useAuthActions } from "@/store/auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
    router.replace("/(guest)");
  };

  return (
    <View className="flex-1 flex flex-col gap-4 p-4">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogout}
        className="p-4 flex flex-row gap-2 items-center rounded-xl bg-white"
      >
        <MaterialIcons name="logout" size={20} color="black" />
        <Text className="text-base mb-0.5 font-medium text-left">Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        className="p-4 flex flex-row gap-2 items-center rounded-xl bg-white"
      >
        <Octicons name="trash" size={20} color="black" />
        <Text className="text-base mb-0.5 font-medium text-left">
          Delete Account
        </Text>
      </TouchableOpacity>
    </View>
  );
}
