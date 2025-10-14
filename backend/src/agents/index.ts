import * as z from "zod";
import { Bindings } from "..";
import { Github } from "./github";
import { Model } from "./model";

export class Agent extends Github {
  model: Model;

  constructor(installationId: string, env: Bindings) {
    super(installationId, env);
    this.model = new Model(env);
  }

  async suggestFix({
    files,
    userPrompt,
    owner,
    repo,
  }: {
    userPrompt: string;
    files: { path: string; sha: string }[];
    owner: string;
    repo: string;
  }) {
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const content = await this.getFileContent(owner, repo, file.sha);
        return `File: ${file.path}\n\n${content}`;
      })
    );

    const prompt = `
      User prompt: ${userPrompt}

      Here are the contents of the files the user has provided:
      ---
      ${fileContents.join("\n\n---\n\n")}
      ---

      Based on the user's prompt and the file contents, please provide a fix.
      You can use the available tools to create a pull request with the fix.
    `;

    const tools = {
      makePR: this.makePR,
    };

    return this.model.stream({ prompt, tools });
  }

  async applyFix({}) {
    // this.makePR()
  }
}
