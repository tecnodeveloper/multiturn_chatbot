import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, provider, model: requestedModel, fileContexts } = await req.json();
    console.log("Chat API Request - Provider:", provider, "Model:", requestedModel);

    let apiKey = "";
    let baseURL = "";
    let model = requestedModel || "";
    let aiProvider: any;

    if (provider === "Groq") {
      apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
      const groq = createGroq({
        apiKey: apiKey,
      });
      aiProvider = groq;
      // If model is missing or doesn't look like a Groq/Mixtral model, use default
      if (!model || (!model.startsWith("llama") && !model.startsWith("mixtral"))) {
        model = "llama-3.3-70b-versatile";
      }
    } else if (provider === "OpenRouter") {
      apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
      baseURL = "https://openrouter.ai/api/v1";
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
      });
      aiProvider = openai;
      // If model doesn't have a slash (like meta-llama/...), it's probably a stale ID from Groq/Ollama
      if (!model || !model.includes("/")) {
        model = "meta-llama/llama-3.3-70b-instruct";
      }
    } else if (provider === "Ollama") {
      apiKey = "ollama";
      baseURL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/v1";
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
      });
      aiProvider = openai;
      // If model has a slash or looks like a Groq model ID, use Ollama default
      if (!model || model.includes("/") || model.includes("-versatile") || model.includes("-8192")) {
        model = "llama3:latest";
      }
    }

    if (!apiKey && provider !== "Ollama") {
      return new Response(
        JSON.stringify({ error: `${provider} API key not found` }),
        { status: 400 },
      );
    }

    console.log(`[CHAT API] Final Choice - Provider: ${provider}, Model: ${model}`);

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
