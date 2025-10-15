import { tool } from "ai";
import { Octokit } from "octokit";
import { z } from "zod";
import { Bindings } from "..";
import { createOctokitApp } from "../octokit";
import { Model } from "./model";

export class Github {
  app: Promise<Octokit>;

  model: Model;

  constructor(installationId: string, env: Bindings) {
    const octokitApp = createOctokitApp(env);
    this.app = octokitApp.getInstallationOctokit(Number(installationId));
    this.model = new Model(env);
  }

  protected async getFileContent(
    owner: string,
    repo: string,
    file_sha: string
  ) {
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

    console.log("file content ->", decoded);

    return decoded;
  }

  getFileContents = tool({
    description: "Get the content of multiple files from a GitHub repository.",
    parameters: z.object({
      aiPrompt: z
        .string()
        .describe(
          "AI instruction that contain user query to perform certain opreations on file."
        ),
      owner: z.string().describe("The owner of the repository."),
      repo: z.string().describe("The name of the repository."),
      files: z
        .array(
          z.object({
            path: z.string().describe("The path to the file."),
            sha: z.string().describe("The SHA of the file blob."),
          })
        )
        .describe("An array of file objects containing path and sha."),
    }),
    execute: async ({ owner, repo, files, aiPrompt }) => {
      try {
        const fileContents = await Promise.all(
          files.map(async (file) => {
            const content = await this.getFileContent(owner, repo, file.sha);
            return { path: file.path, content };
          })
        );

        const response = await this.model.getText({
          systemPrompt: `
            Use this file content to help resolve user's query. 
            Only stick to this file content.

           
          `,
          messages: [
            {
              id: "1",
              content: ` User Query: ${aiPrompt}
            ${fileContents.map((f) => `${f.path} -> ${f.content}`).join("\n")}`,
              role: "user",
            },
          ],
        });

        return { fileContents, type: "READ_FILE", response };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  });

  makePR = tool({
    description: "Create a pull request.",
    parameters: z.object({
      owner: z.string().describe("The owner of the repository."),
      repo: z.string().describe("The name of the repository."),
      title: z.string().describe("The title of the pull request."),
      head: z
        .string()
        .describe("The name of the branch where the changes are implemented."),
      base: z
        .string()
        .describe("The name of the branch you want the changes pulled into."),
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
