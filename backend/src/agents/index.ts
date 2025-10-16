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
    this.setOwner(owner);
    this.setRepo(repo);
    this.setFileDetails(files);

    const getFileContents = this.getFileContents;
    return this.model.stream({
      tools: { downloadFileContent: getFileContents },
      messages,
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
