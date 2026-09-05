import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config();

 console.log(process.env.GEMINI_API_KEY_1);

const ai =  new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY_1
  
})
  
export default async function generateDocSummary(doc){
    console.log("generating summary...")



    const code = doc.pageContent.slice(0,10000);
    //limit to 10000 characters



    let systemPrompt =[`You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects`,
    `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
Here is the code:
---
${code}
---
            Give a summary no more than 100 words of the code above and don't add any boiler plate or extra information like greeting. Just summarise the code in a concise manner. I am going to use your summary to generate embeddings and perform RAG of this summary. Remember: don't add any boiler plate or extra information.`,
  ];


  const response =  await ai.models.generateContent({
    model:'gemini-3.6-flash',
    contents:systemPrompt
  })
  console.log("summary Generated for:",doc.metadata.source);

  return response.text
    

}

// let result = await generateDocSummary({
//  pageContent: 'import express from "express";\n' +
//       ' import { generateQuiz } from "./lib/gemini.js";\n' +
//       '  \n' +
//       ' const app = express();\n' +
//       ' app.get("/quiz/:topic", async (req,res)=>{\n' +
//       '    const {topic} = req.params;\n' +
//       '    console.log("topic recived from client--------",topic);\n' +
//       '    const quizArr =  await generateQuiz(topic);\n' +
//       '\n' +
//       '\n' +
//       '    console.log("quiz generated sucessfully:: " ,quizArr);\n' +
//       '\n' +
//       '    res.json({\n' +
//       '        msg:"quiz generated sucessfullly",\n' +
//       '        data:quizArr,\n' +
//       '        });\n' +
//       ' });\n' +
//       ' app.listen("8080",()=>{\n' +
//       '    console.log("server is listening on port 8080");\n' +
//       ' })',
//     metadata: {
//       source: 'server.js',
//       repository: 'https://github.com/mahiyasyed78-rgb/ai-quiz-genererator',
//       branch: 'main'
//     },
//     id: undefined,

// })
// console.log("summary generted",result);
