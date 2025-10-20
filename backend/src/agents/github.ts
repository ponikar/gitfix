import { tool } from "ai";
import { Octokit } from "octokit";
import { z } from "zod";
import { Bindings } from "..";
import { createOctokitApp } from "../octokit";
import { Model } from "./model";

export class Github {
  app: Promise<Octokit>;

  model: Model;

  activeChanges: { [filePath: string]: string } = {};
  owner: string = "";
  repo: string = "";

  setActiveChanges(activeChanges: { [filePath: string]: string }) {
    this.activeChanges = activeChanges;
    console.log("Active changes set", this.activeChanges);
  }

  setOwner(owner: string) {
    this.owner = owner;
    console.log("Owner set", this.owner);
  }

  setRepo(repo: string) {
    this.repo = repo;
    console.log("Repo set", this.repo);
  }

  fileDetails: { path: string; sha: string }[] = [];

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

    return decoded;
  }

  setFileDetails(files: { path: string; sha: string }[]) {
    this.fileDetails = files;
    console.log("Setting file details", this.fileDetails);
  }

  fetchFilesAndResolveQuery = tool({
    description: "Get the content of multiple files from a GitHub repository",
    parameters: z.object({
      aiPrompt: z
        .string()
        .describe(
          "Must share AI instruction that contain user query to perform certain opreations on file."
        ),
      changeType: z
        .enum(["incremental", "new"])
        .describe(
          "Determine if the user is asking for incremental changes to previously modified content or new changes from scratch."
        )
        .default("incremental"),
    }),
    execute: async ({ aiPrompt, changeType }) => {
      try {
        const fileContents = await Promise.all(
          this.fileDetails.map(async (file) => {
            const originalContent = await this.getFileContent(
              this.owner,
              this.repo,
              file.sha
            );
            const activeChange = this.activeChanges?.[file.path];

            console.log("changetype", changeType, this.activeChanges);

            const content =
              changeType === "incremental" && activeChange
                ? activeChange
                : originalContent;

            return {
              path: file.path,
              content,
            };
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
                  .describe(
                    "The original content of the file that was used to generate the diff."
                  ),
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
                  .map((f) => {
                    return `File: ${f.path}\n\n\`\`\`\n${f.content}\n\`\`\``;
                  })
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

  public async applyFixAndRaisePR({
    owner,
    repo,
    base,
    head,
    files,
  }: {
    owner: string;
    repo: string;
    base: string;
    head: string;
    files: { path: string; content: string }[];
  }) {
    try {
      const octokit = await this.app;

      console.log("[octokit ref] ->", octokit);

      const { data: baseRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${base}`,
      });
      const baseSha = baseRef.object.sha;

      const { data: baseCommit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: baseSha,
      });
      const baseTreeSha = baseCommit.tree.sha;

      const fileBlobs = await Promise.all(
        files.map(async (file) => {
          const { data: blob } = await octokit.rest.git.createBlob({
            owner,
            repo,
            content: file.content,
            encoding: "utf-8",
          });
          return {
            path: file.path,
            sha: blob.sha,
            mode: "100644" as const,
            type: "blob" as const,
          };
        })
      );

      const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: fileBlobs,
      });

      const {
        object: { commitMessage, title, description },
      } = await this.model.generateObject({
        messages: [
          {
            id: "1",
            content: "Generate following props",
            role: "user",
          },
        ],
        systemPrompt: `Generate a concise and descriptive commit message in the conventional commit format for the following file changes:\n\n${files
          .map((f) => `File: ${f.path}`)
          .join("\n")}`,
        schema: z.object({
          title: z.string(),
          commitMessage: z.string(),
          description: z.string(),
        }),
      });

      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [baseSha],
      });

      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${head}`,
        sha: newCommit.sha,
      });

      const { data: pullRequest } = await octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body: description,
      });

      return { pullRequestUrl: pullRequest.html_url };
    } catch (error: any) {
      console.error("Error in applyFixAndRaisePR:", error);
      return { error: error.message };
    }
  }
}
