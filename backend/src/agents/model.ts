import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDataStreamResponse, LanguageModel, streamText } from "ai";
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

  stream({ prompt, tools }: { prompt: string; tools?: any }) {
    const model = this.model;
    return createDataStreamResponse({
      async execute(dataStream) {
        const result = await streamText({
          model: model,
          messages: [{ role: "user", content: prompt }],
          tools,
        });

        result.mergeIntoDataStream(dataStream);
      },
      onError(error) {
        console.error("[stream error]", error);
        return error instanceof Error ? error.message : String(error);
      },
    });
  }
}
