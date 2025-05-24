import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  // get file
  // extract text 
  // get text
  // chunk text
  // Embed text using embeddings model
  // Store embeddings in vector database

  return result.toDataStreamResponse();
}
