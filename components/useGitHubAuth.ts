import { useAuthActions } from "@/store/auth";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useRouter } from "expo-router";
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

  const router = useRouter();

  const [request, _, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID as string,
      scopes: ["identity"],
      redirectUri: makeRedirectUri({
        native: "gitfix://callback",
      }),
      usePKCE: true,
    },
    discovery
  );

  const login = async () => {
    try {
      const authResponse = await promptAsync();
      if (authResponse?.type === "success") {
        const { code, state } = authResponse.params;

        console.log("authResponse", authResponse);

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
            code_verifier: request?.codeVerifier,
          }),
        });

        if (!tokenResponse.ok) {
          console.log("not ok", tokenResponse.toString());
        }

        const { access_token, ...rest } = await tokenResponse.json();

        console.log("access_token", access_token, rest);

        if (access_token) {
          setAccessToken(access_token);
          router.replace("/repos");
          return { access_token, state };
        } else {
          throw new Error("No access token");
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
