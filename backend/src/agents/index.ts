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
    filesUrls,
    userPrompt,
  }: {
    userPrompt: string;
    filesUrls: string[];
  }) {
    const content = await Promise.all(filesUrls.map(this.downloadFileContent));

    const result = await this.model.generateModelObject({
      prompt: `${userPrompt}
         files: ${content.join("\n")}
        `,
      schema: z.object({
        fix: z.string(),
      }),
    });

    return result;
  }

  async applyFix({}) {
    // this.makePR()
  }
}
