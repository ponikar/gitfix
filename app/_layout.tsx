import { useAuthState } from "@/store/auth";
import { Slot, SplashScreen, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  const { accessToken } = useAuthState();
  const segments = useSegments();
  const router = useRouter();
  const inProtectedGroup = segments[0] === "(protected)";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (accessToken && !inProtectedGroup) {
        // navigate only when needed
        router.replace("/(protected)/(tabs)/repos");
      } else if (!accessToken && inProtectedGroup) {
        router.replace("/(guest)");
      }

      SplashScreen.hide();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [accessToken, inProtectedGroup]);

  // Slot will just render child routes
  return <Slot />;
}
