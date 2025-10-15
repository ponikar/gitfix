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

        const textResponseSchema = z.object({
          type: z.literal("TEXT_RESPONSE"),
          response: z
            .string()
            .describe("A simple text response to the user's query."),
        });

        const diffResponseSchema = z.object({
          type: z.literal("GIT_DIFF"),
          files: z
            .array(
              z.object({
                path: z.string().describe("The path of the file."),
                originalContent: z
                  .string()
                  .describe("The original part content of the file."),
                newContent: z
                  .string()
                  .describe("The new, modified content of the file."),
              })
            )
            .describe(
              "An array of files with their original and new part of content for diffing."
            ),
        });

        const responseSchema = z.union([
          textResponseSchema,
          diffResponseSchema,
        ]);

        const { object: response } = await this.model.generateObject({
          schema: responseSchema,
          systemPrompt: `
            You are a helpful AI assistant. Based on the user's query and the provided file content, you must decide on the format of your response.

            You have two choices:

            1.  **Text Response**: If the user is asking a question, wants an explanation, or anything that can be answered with plain text, use the 'TEXT_RESPONSE' schema.

            2.  **Git Diff**: If the user wants to perform a change, refactor, or fix code, provide the original and the proposed new code for the relevant files using the 'GIT_DIFF' schema. You must provide the complete original and new content for each file you are modifying.

            Analyze the user's query and the file content carefully to make the right choice.

            User Query: ${aiPrompt}
          `,
          messages: [
            {
              id: "1",
              content: `
                Here is the content of the files:
                ${fileContents
                  .map((f) => `File: ${f.path}\n\n\`\`\`\n${f.content}\n\`\`\``)
                  .join("\n\n")}
              `,
              role: "user",
            },
          ],
        });

        return { fileContents, response };
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

  generateDiff = tool({
    description:
      "Generate a git diff to highlight changes between old and new code.",
    parameters: z.object({
      files: z.string().describe("The path of the file, e.g., 'src/index.js'."),
      oldChanges: z.string().describe("The original code content."),
      newChanges: z.string().describe("The modified code content."),
    }),
    execute: async ({ files, oldChanges, newChanges }) => {
      try {
        const response = await this.model.getText({
          systemPrompt: `
            You are an expert at creating git diffs.
            Generate a git diff for the provided file.
            The user will provide the file path, the old code, and the new code.
            Your response should be ONLY the git diff, without any extra explanation.
            The diff should be in a format that can be used by other tools.
            For example:
            \`\`\`diff
            --- a/file.js
            +++ b/file.js
            @@ -1,4 +1,4 @@
             console.log("hello");
            -const old = 1;
            +const new = 2;
             console.log("world");
            \`\`\`
          `,
          messages: [
            {
              id: "1",
              role: "user",
              content: `
                Generate a diff for the file: ${files}

                <<< OLD CODE
                ${oldChanges}
                >>> OLD CODE

                <<< NEW CODE
                ${newChanges}
                >>> NEW CODE
              `,
            },
          ],
        });

        return { diff: response, type: "GIT_DIFF" };
      } catch (error: any) {
        return { error: error.message };
      }
    },
  });
}
