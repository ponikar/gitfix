import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  createDataStreamResponse,
  LanguageModel,
  Message,
  streamText,
} from "ai";
import { Bindings } from "..";
export class Model {
  private model: LanguageModel;

  constructor(
    env: Bindings,
    provider: string = "google",
    modelName: string = "gemini-2.0-flash-001"
  ) {
    if (provider === "google") {
      const google = createGoogleGenerativeAI({
        apiKey: env.GOOGLE_API_KEY,
      });
      this.model = google("gemini-2.0-flash-001");
      // } else if (provider === "openai") {
      //   const openai = createOpenAI({
      //     apiKey: env.OPENAI_API_KEY,
      //   });
      //   this.model = openai(modelName);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  stream({
    tools,
    messages,
    systemPrompt,
  }: {
    tools?: any;
    messages: Message[];
    systemPrompt?: string;
  }) {
    const model = this.model;

    return createDataStreamResponse({
      async execute(dataStream) {
        const result = await streamText({
          model: model,
          messages: messages,
          toolChoice: "auto",
          tools,
          // TODO: UPDATE THIS
          system: `
           Keep the response short, simple and straightforward. 
           Help user go t@hrough the codebase. 
           If file content is mentioned, stricly rely on that. 
           Do not made up any response.

           ${systemPrompt}
          `,
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
