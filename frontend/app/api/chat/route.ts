import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, provider = "Gemini", model: requestedModel, fileContexts } = await req.json();

    let apiKey = "";
    let baseURL = "";
    let model = requestedModel || "";
    let aiProvider: any;

    if (provider === "Gemini" || provider === "Google") {
      apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
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
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        "";
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });
      aiProvider = google;
      model = "gemini-3.5-flash";
    }

    if (!apiKey && provider !== "Ollama") {
      return new Response(
        JSON.stringify({ error: `${provider} API key not found. Please verify GEMINI_API_KEY in frontend/.env.local` }),
        { status: 400 },
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
    });


    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
