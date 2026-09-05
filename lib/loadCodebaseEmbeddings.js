
import fs from "fs/promises"

export default async function  loadCodebaseEmbeddings(){
    console.log("fetching codebase embeddings...")
    const data =  await fs.readFile("embedding.json","utf-8");

    return await JSON.parse(data);

}

//loadCodebaseEmbeddings();