import { Octokit } from "octokit";
import { Bindings } from "..";
import { createOctokitApp } from "../octokit";
import { tool } from "ai";
import { z } from "zod";

export class Github {
  app: Promise<Octokit>;

  constructor(installationId: string, env: Bindings) {
    const octokitApp = createOctokitApp(env);
    this.app = octokitApp.getInstallationOctokit(Number(installationId));
  }

  protected async getFileContent(owner: string, repo: string, file_sha: string) {
    const octokit = await this.app;
    const { data } = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha,
    });

    if (data.encoding !== "base64") {
      throw new Error(`Unsupported encoding ${data.encoding}`);
    }

    const decoded = atob(data.content);
    return decoded;
  }

  makePR = tool({
    description: "Create a pull request.",
    parameters: z.object({
      owner: z.string().describe("The owner of the repository."),
      repo: z.string().describe("The name of the repository."),
      title: z.string().describe("The title of the pull request."),
      head: z.string().describe("The name of the branch where the changes are implemented."),
      base: z.string().describe("The name of the branch you want the changes pulled into."),
      body: z.string().optional().describe("The contents of the pull request."),
    }),
    execute: async ({ owner, repo, title, head, base, body }) => {
      try {
        const octokit = await this.app;
        const { data } = await octokit.pulls.create({
          owner,
          repo,
          title,
          head,
          base,
          body,
        });
        return { pullRequestUrl: data.html_url };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  });
}
