[
  Document {
    pageContent: '{\n' +
      '  "name": "backend",\n' +
      '  "version": "1.0.0",\n' +
      '  "description": "",\n' +
      '  "main": "index.js",\n' +
      '  "directories": {\n' +
      '    "lib": "lib"\n' +
      '  },\n' +
      '  "scripts": {\n' +
      '    "test": "echo \\"Error: no test specified\\" && exit 1"\n' +
      '  },\n' +
      '  "keywords": [],\n' +
      '  "author": "",\n' +
      '  "license": "ISC",\n' +
      '  "type": "module",\n' +
      '  "dependencies": {\n' +
      '    "@google/genai": "^2.18.0",\n' +
      '    "dotenv": "^17.4.2",\n' +
      '    "express": "^5.2.1"\n' +
      '  }\n' +
      '}\n',
    metadata: {
      source: 'package.json',
      repository: 'https://github.com/mahiyasyed78-rgb/ai-quiz-genererator',
      branch: 'main'
    },
    id: undefined
  },
  Document {
    pageContent: 'import express from "express";\n' +
      ' import { generateQuiz } from "./lib/gemini.js";\n' +
      '  \n' +
      ' const app = express();\n' +
      ' app.get("/quiz/:topic", async (req,res)=>{\n' +
      '    const {topic} = req.params;\n' +
      '    console.log("topic recived from client--------",topic);\n' +
      '    const quizArr =  await generateQuiz(topic);\n' +
      '\n' +
      '\n' +
      '    console.log("quiz generated sucessfully:: " ,quizArr);\n' +
      '\n' +
      '    res.json({\n' +
      '        msg:"quiz generated sucessfullly",\n' +
      '        data:quizArr,\n' +
      '        });\n' +
      ' });\n' +
      ' app.listen("8080",()=>{\n' +
      '    console.log("server is listening on port 8080");\n' +
      ' })',
    metadata: {
      source: 'server.js',
      repository: 'https://github.com/mahiyasyed78-rgb/ai-quiz-genererator',
      branch: 'main'
    },
    id: undefined
  },
  Document {
    pageContent: 'import {GoogleGenAI} from "@google/genai";\n' +
      'import dotenv from "dotenv";\n' +
      ' \n' +
      'dotenv.config();\n' +
      '\n' +
      'console.log("loading geminikey", process.env.GEMINI_API_KEY);\n' +
      '\n' +
      '\n' +
      ' const GEMINI_API_KEY= process.env.GEMINI_API_KEY;\n' +
      ' const ai=  new GoogleGenAI({apiKey:GEMINI_API_KEY});\n' +
      '\n' +
      '//  generateQuiz("reactjs");\n' +
      '\n' +
      ' export const generateQuiz = async(topic)=>{\n' +
      '    const systemPrompt= "Hey Gemini, Act as a expert quiz generator who is expert in generating quizes and taking examinations, I am build a AI powered quiz generator full stack application, for that generate me an array of 2  quizzes related to " +\n' +
      '    topic +\n' +
      ' \n' +
      '   " in the given format { \'question\': \'how many months in a year\', \'option1\': \'10\', \'option2\': \'12\', \'option3\': \'8\', \'option4\': \'6\', \'correctOption\': \'option2\' }. don\'t add any boiler plate text like ```json, send directly array of objects. I am using yourresponse to directly convert into javascript object using \'JSON.parse\' so send reponse accordingly.";\n' +
      '\n' +
      '\n' +
      '  const response =  await ai.models.generateContent({\n' +
      '    model:"gemini-3.6-flash",\n' +
      '    contents:systemPrompt,\n' +
      '  });\n' +
      '\n' +
      '\n' +
      '  const quizArr = JSON.parse(response.text)\n' +
      '  console.log("data from ai ----",quizArr)\n' +
      '  return quizArr\n' +
      '  //retrun Json.parse(response.text);\n' +
      '  \n' +
      '   \n' +
      '\n' +
      ' }\n' +
      '\n' +
      '//  generateQuiz("reactjs");\n' +
      '\n' +
      '\n' +
      '\n',
    metadata: {
      source: 'lib/gemini.js',
      repository: 'https://github.com/mahiyasyed78-rgb/ai-quiz-genererator',
      branch: 'main'
    },
    id: undefined