import { App } from "octokit";

export function createOctokitApp(env: any) {
  return new App({
    appId: env.APP_ID,
    privateKey: env.PRIVATE_KEY.replace(/\n/g, "\n"),
    oauth: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_SECRET_ID,
    },
  });
}
