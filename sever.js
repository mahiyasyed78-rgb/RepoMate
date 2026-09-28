import express from express;
import indexRepo from "./lib/indexRepo";



const app = express();
app.use(express.json());


app.post("/add-repo",async(req,res)=>{
    const {githubURL,githubToken } = req.body;
    
    await  indexRepo(githubURL,githubToken);
 

    res.json({
        message:"Repo indexed sucessfully"
    })
})

app.post('/ask-question',(req,res)=>{
    const {UserQuery} =  req.body;


    res.json({
        msg:"Repo Indexed sucessfully,embeddings generataed and saved to embeddings.json",
});


});
app.listen("8080",()=>{
    console.log("server is listening on port 8080")
})