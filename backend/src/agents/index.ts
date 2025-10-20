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

    const fetchFilesAndResolveQuery = this.fetchFilesAndResolveQuery;

    const systemPrompt = `
You are a GitHub code assistant. When responding to user queries about code:

**Tool Usage - fetchFilesAndResolveQuery:**
You MUST use this tool to process user queries. Do NOT ask the user for additional input.

How to use it:
1. **aiPrompt**: Analyze the user's query and generate a clear, refined instruction for the AI. This should be a complete, self-contained prompt that includes:

2. **changeType**: Set this to:
   - "incremental" - if user wants to modify previously changed content
   - "new" - if user wants changes from scratch or initial review

**When to call this tool:**
- Always call this tool when the user asks about code files
- Call it with refined prompts - never pass raw user input directly
- Use it to analyze, explain, or suggest changes to the provided files

Do not make assumptions about file content - always use the tool to fetch and analyze files.
    `;

    return this.model.stream({
      tools: { fetchFilesAndResolveQuery },
      messages,
      systemPrompt,
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
