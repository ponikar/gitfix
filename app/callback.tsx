import { Text, View } from "@/components/Themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as React from "react";

const discovery = {
  tokenEndpoint: "https://github.com/login/oauth/access_token",
};

export default function Callback() {
  const router = useRouter();
  const { code } = useLocalSearchParams();

  React.useEffect(() => {
    if (typeof code === "string") {
      const exchangeCodeForToken = async () => {
        try {
          const tokenResponse = await fetch(discovery.tokenEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
              client_secret: process.env.EXPO_PUBLIC_GITHUB_SECRET_ID,
              code,
            }),
          });
          const { access_token } = await tokenResponse.json();
          console.log("Access token received:", access_token);
          if (access_token) {
            await SecureStore.setItemAsync("github_access_token", access_token);
            router.replace("/repos");
          }
        } catch (error) {
          console.error("Error exchanging code for token:", error);
        }
      };
      exchangeCodeForToken();
    }
  }, [code]);

  return (
    <View>
      <Text>Logging you in...</Text>
    </View>
  );
}
