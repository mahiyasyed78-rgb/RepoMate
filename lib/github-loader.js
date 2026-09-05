import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";


import dotnev from "dotenv";
dotnev.config();

export default async function loadGithubRepo(githubURL,githubToken) {
  const loader = new GithubRepoLoader(githubURL, {
      recuersive : true,
    accessToken: process.env.GITHUB_TOKEN,
    ignoreFiles:[
      "gitignore",
      "node_module/**",
      "dist/**",
      "build/**",
      "package-lock.json",
      "yarn.lock",

    ],



  
  });

  const docsArray = await loader.load();

  // console.log("GitHub documents loaded:", docsArray.length);

  console.log(docsArray);

  
}


console.log("Loading GitHub repository...",  loadGithubRepo);
  loadGithubRepo("https://github.com/mahiyasyed78-rgb/ai-quiz-genererator");
  