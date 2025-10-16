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
    owner,
    repo,
    messages = [],
    activeChanges = {},
  }: {
    userPrompt: string;
    files: { path: string; sha: string }[];
    owner: string;
    repo: string;
    messages: Message[];
    activeChanges?: { [filePath: string]: string };
  }) {
    this.setActiveChanges(activeChanges);
    const getFileContents = this.getFileContents;
    return this.model.stream({
      tools: { downloadFileContent: getFileContents },
      messages,
      systemPrompt: files.length
        ? `
       DO NOT ASK USER DETAILS FOR path and sha, Pick the details from here.
       USE THIS DETAILS WHEN CALLING TOOL
       Use this as references to download files:
        Owner: ${owner}, Repo: ${repo}
        To Downloads files use this information
        ${files.map((d) => `path: ${d.path}, sha: ${d.sha}`).join("\n")}
        `
        : "",
    });
  }

  async applyFix({
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
    return this.applyFixAndRaisePR({
      owner,
      repo,
      base,
      head,
      files,
    });
  }
}
