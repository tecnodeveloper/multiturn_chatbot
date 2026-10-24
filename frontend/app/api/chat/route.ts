import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { classifyAIError } from "@/lib/ai-errors";

export const runtime = "edge";

export async function POST(req: Request) {
  let requestedModel = "";
  try {
    const body = await req.json();
    requestedModel = body.model || "";
    const { messages, provider = "Gemini", fileContexts } = body;

    let apiKey = "";
    let baseURL = "";
    let model = requestedModel;
    let aiProvider: any;

    if (provider === "Gemini" || provider === "Google") {
      apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        "";
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });
      aiProvider = google;
      if (!model || !model.startsWith("gemini")) {
        model = "gemini-3.5-flash";
      }
    } else if (provider === "Ollama") {
      apiKey = "ollama";
      baseURL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/v1";
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
      });
      aiProvider = openai;
      if (!model || model.includes("/") || model.startsWith("gemini")) {
        model = "llama3:latest";
      }
    } else {
      // Default fallback to Gemini
      apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        "";
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });
      aiProvider = google;
      model = "gemini-3.5-flash";
    }

    if (!apiKey && provider !== "Ollama") {
      const errSpec = classifyAIError({
        message: `${provider} API key not found. Please verify GEMINI_API_KEY in frontend/.env.local`,
        kind: "MISCONFIG",
      });
      return new Response(
        JSON.stringify({
          error: errSpec.message,
          error_detail: errSpec,
        }),
        {
          status: errSpec.code,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const finalMessages = [...messages];
    if (fileContexts) {
      finalMessages.unshift({
        role: "system",
        content: `You have access to the following documents. Use them to answer questions accurately:\n\n${fileContexts}`,
      });
    }

    const result = await streamText({
      model: aiProvider(model),
      messages: finalMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      maxRetries: 0,
      abortSignal: req.signal,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    const errSpec = classifyAIError(error);

    return new Response(
      JSON.stringify({
        error: errSpec.message,
        error_detail: errSpec,
      }),
      {
        status: errSpec.code,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
