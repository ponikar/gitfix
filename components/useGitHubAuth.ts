import { useAuthActions } from "@/store/auth";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export function useGitHubAuth() {
  const {
    setAccessToken,
    setCode,
    setGithubState,
    logout: clearAuth,
  } = useAuthActions();

  const [_r, _, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID as string,
      scopes: ["identity", "repo"],
      redirectUri: makeRedirectUri({
        native: "gitfix://callback",
      }),
    },
    discovery
  );

  const login = async () => {
    try {
      const authResponse = await promptAsync();
      if (authResponse?.type === "success") {
        const { code, state } = authResponse.params;

        setCode(code);
        if (state) {
          setGithubState(state);
        }

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

        if (access_token) {
          setAccessToken(access_token);
          return { access_token, state };
        }
      }
      return null;
    } catch (error) {
      console.error("Error logging in:", error);
      return null;
    }
  };

  const logout = async () => {
    clearAuth();
    return true;
  };

  return { login, logout };
}
