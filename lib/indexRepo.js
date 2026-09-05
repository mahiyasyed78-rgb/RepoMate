import loadGithubRepo from "./github-loader.js";
import generateDocSummary from "./generateDocSummary.js";
import embedSummary from "./embedSummary.js";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function indexRepo(githubURL, githubToken) {
  try {
    console.log("Before loading repo");

    // Step 1: Load GitHub repository
    const docsArray = await loadGithubRepo(githubURL, githubToken);

    console.log("Repo loaded:", docsArray.length);

    const result = [];

    // Step 2: Process every document
    for (const doc of docsArray) {
      console.log("Processing:", doc.metadata.source);

      // Generate summary
      const docSummary = await generateDocSummary(doc);

      console.log("Summary generated");

      // Generate embedding
      const docEmbedding = await embedSummary(docSummary);

      console.log("Embedding generated");

      // Store everything
      result.push({
        summary: docSummary,
        embeddings: docEmbedding,
        sourcecode: doc.pageContent,
        fileName: doc.metadata.source,
      });
    }

    // Step 3: Create embeddings.json
    const filePath = path.join(__dirname, "embeddings.json");

    await fs.writeFile(
      filePath,
      JSON.stringify(result, null, 2),
      "utf-8"
    );

    console.log("✅ embeddings.json saved!");
    console.log("📁 File location:", filePath);

    return result;

  } catch (error) {
    console.error("❌ Error indexing repository:", error);
    throw error;
  }
}