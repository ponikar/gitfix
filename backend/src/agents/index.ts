import { Message } from "ai";
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
    files = [],
    userPrompt,
    owner,
    repo,
    messages = [],
  }: {
    userPrompt: string;
    files: { path: string; sha: string }[];
    owner: string;
    repo: string;
    messages: Message[];
  }) {
    const fileContents = files.length
      ? await Promise.all(
          files.map(async (file) => {
            const content = await this.getFileContent(owner, repo, file.sha);
            return `File: ${file.path}\n\n${content}`;
          })
        )
      : [];

    return this.model.stream({
      messages: fileContents.length
        ? [
            ...messages,
            {
              id: new Date().getTime().toString(),
              role: "data",
              content: `
            ${fileContents.map((p, index) => `${files[index]} -> ${p}`)}
          `,
            },
          ]
        : messages,
    });
  }

  async applyFix({}) {
    // this.makePR()
  }
}
