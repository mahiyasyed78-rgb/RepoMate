import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();


const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY_QUERY,

});

export default async function embedQuery(userQuery){
    console.log("Genarating Embeddings for query...")
    const response =  await ai.models.embedContent({
        model:"gemini-embedding-2",
        contents:[userQuery],

    });

    return response.embeddings[0].values

}