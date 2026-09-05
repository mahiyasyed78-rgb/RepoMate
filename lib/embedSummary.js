import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_2,
});

export default async function embedSummary(docSummary) {
  try {
    console.log("Generating embedding...");

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: docSummary,
    });

    const embedding = response.embeddings[0].values;

    console.log("Embedding generated successfully");

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
