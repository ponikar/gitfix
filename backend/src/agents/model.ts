import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModel } from "ai";
import { z } from "zod";
import { Bindings } from "..";
export class Model {
  private model: LanguageModel;

  constructor(
    env: Bindings,
    provider: string = "google",
    modelName: string = "gemini-1.5-flash"
  ) {
    if (provider === "google") {
      const google = createGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
      });
      this.model = google(modelName);
      // } else if (provider === "openai") {
      //   const openai = createOpenAI({
      //     apiKey: env.OPENAI_API_KEY,
      //   });
      //   this.model = openai(modelName);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async generateModelObject({
    prompt,
    schema,
  }: // tools = [],
  {
    prompt: string;
    schema: z.ZodType;
    // tools?: (typeof Tools.tools)[];
  }) {
    // const { object } = await generateObject({
    //   model: this.model,
    //   prompt,
    //   schema,
    // });
    // return object;
  }
}
