import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export function useGitHubAuth() {
  const [token, setToken] = React.useState<string | null>(null);
  const [hasRepoScope, setHasRepoScope] = React.useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID as string,
      scopes: ["identity", "repo"],
      redirectUri: makeRedirectUri({
        native: "gitfix://callback",
      }),
    },
    discovery
  );

  const checkRepoScope = async (accessToken: string) => {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const scopes = response.headers.get("x-oauth-scopes");
      if (scopes && scopes.includes("repo")) {
        setHasRepoScope(true);
      }
    } catch (error) {
      console.error("Error checking repo scope:", error);
    }
  };

  const login = async () => {
    await promptAsync();
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("github_access_token");
    setToken(null);
    setHasRepoScope(false);
    router.replace("/");
    console.log("Logged out");
  };

  React.useEffect(() => {
    const getToken = async () => {
      const storedToken = await SecureStore.getItemAsync("github_access_token");
      console.log("Stored token on mount:", storedToken);
      if (storedToken) {
        setToken(storedToken);
        checkRepoScope(storedToken);
        router.replace("/repos");
      }
    };
    getToken();
  }, []);

  return { token, hasRepoScope, login, logout };
}
