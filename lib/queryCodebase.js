import embedQuery from "./embedQuery";
import loadCodebaseEmbeddings from "./frontend/loadCodebaseEmbeddings";
import cosineSimilarity from "./cosineSimilarity";

export default async function queryCodebase(userQuery){
    //step1: generate embeddongs for userQuery
    const queryEmbedding = await embedQuery(userQuery);
    //[]

    //step 2: Load Codebase embeddings

    const codebaseEmbeddings =  await loadCodebaseEmbeddings();
    //[{[]},{[]},{[]}]


    //step3:Generate cosine similarity between queryEmbedding and all child of codebaseEmbeddings
    // const simalrityscore = cosineSimilarity(
    //     queryEmbedding,
    //     codebaseEmbeddings[0].embeddings,

    // );

    const resultArr =  codebaseEmbeddings.map((fileObj)=>{
        let simalrityScore =  cosineSimilarity(queryEmbedding,fileObj.embeddings);


        return {
            similarityScore: similarityScore,
            filename:fileObj.filename,
            Sourcecode:fileObj.Sourcecode,
            fileSummary:fileObj.summary,

        };

    });


    return resultArr.sort((a,b)=>b.similarityScore - a.similarityScore).filter((result)=> result.simalrityScore>0.6

    );


}