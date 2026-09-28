# GitHub RepoMate — Memory-Powered AI Engineering Agent

> **“AI Agents That Learn Using Hindsight”**

GitHub RepoMate is a memory-enabled AI engineering agent that understands GitHub repositories using Retrieval-Augmented Generation (RAG) and learns from previous debugging experiences using **Hindsight by Vectorize**. It retrieves relevant repository context and past engineering memories to provide contextual coding and debugging assistance. Developer feedback about successful and failed solutions is stored as long-term memory, allowing RepoMate to continuously improve its assistance for future engineering problems.

---

## 🚀 Key Innovation: The Hindsight Learning Loop

Unlike traditional RAG systems that query static documentation, RepoMate possesses **persistent episodic and long-term engineering memory**:

```text
User Problem / Bug
      │
      ▼
Current Repository Analysis (AST / Code Extraction)
      │
      ▼
Cosine Similarity Search (Vector Embeddings)
      │
      ▼
Hindsight Long-Term Memory Recall (Past Experiences)
      │
      ▼
AI Engineering Agent Reasoning (Cross-examining Memory vs Code)
      │
      ▼
Contextual Solution & Root Cause Analysis
      │
      ▼
Developer Feedback (Solved ✓ / Not Solved ✗)
      │
      ▼
Store Experience & Lesson in Hindsight
      │
      ▼
Smarter Assistance for Future Engineering Problems
```

### Critical Agent Reasoning Principle
The agent does **not** blindly say:
> *"A previous memory says X, therefore X is definitely correct."*

Instead, it reasons critically:
> *"A previous engineering experience suggests X (Outcome: SUCCESS/FAILED). I inspected the current repository and found Y. Therefore, X appears relevant / does not apply because Y matches the previous situation."*

---

## 📁 Project Structure

```text
repoMate/
├── package.json                   # Root convenience scripts
├── README.md                      # Comprehensive project documentation
│
├── backend/
│   ├── server.js                  # Express API server with CORS & endpoints
│   ├── package.json               # Backend dependencies and scripts
│   ├── .env                       # Environment keys (Gemini, Hindsight, GitHub)
│   ├── .env.example               # Template environment configuration
│   ├── .gitignore                 # Excludes .env and node_modules
│   ├── embeddings.json            # Local vector embeddings cache
│   ├── .hindsight_local_bank.json # Persistent memory fallback bank
│   │
│   └── lib/
│       ├── github-loader.js       # LangChain GitHub repo document loader
│       ├── indexRepo.js           # Multi-file summary and vector indexing
│       ├── generateDocSummary.js  # Gemini-powered file summarization
│       ├── embedSummary.js        # Summary vector embedding generator
│       ├── embedQuery.js          # User query embedding generator
│       ├── cosineSimilarity.js    # Vector cosine similarity calculator
│       ├── loadCodebaseEmbeddings.js # Embeddings loader & normalizer
│       ├── queryCodebase.js       # Codebase RAG retrieval & ranking
│       ├── askQuestion.js         # Unified RAG + Agent pipeline
│       │
│       ├── hindsight/
│       │   ├── client.js          # Hindsight client & bank initializer
│       │   ├── storeMemory.js     # Memory retention with rich metadata
│       │   └── retrieveMemory.js  # Memory recall with relevance matching
│       │
│       ├── agent/
│       │   └── repoMateAgent.js   # Central AI Agent reasoning layer
│       │
│       ├── feedback/
│       │   └── feedback.js        # Feedback handler for SUCCESS/FAILED lessons
│       │
│       ├── testHindsight.js       # 6-part automated test suite
│       └── testEndToEndDemo.js    # 1-minute end-to-end hackathon demo
│
└── frontend/                      # Modern React UI
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                # UI: Repo Ingestion, QA, Memory Card & Feedback
        ├── main.jsx
        └── index.css              # Cyberpunk developer theme
```

---

## 🛠️ Technology Stack

- **Backend**: Node.js (ES Modules), Express.js, CORS, Dotenv
- **AI Models**: Google Gemini (`gemini-flash-lite-latest`, `gemini-flash-latest`, `gemini-3.8-flash`, `gemini-embedding-001`) via `@google/genai`
- **Memory**: Hindsight by Vectorize (`@vectorize-io/hindsight-client`)
- **Repository Ingestion**: `@langchain/community` (`GithubRepoLoader`)
- **Frontend**: React 19, Vite, Lucide Icons

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY_1=your_gemini_api_key
GEMINI_API_KEY_2=your_gemini_api_key
GEMINI_API_KEY_QUERY=your_gemini_api_key
GEMINI_API_KEY_QUESTION=your_gemini_api_key
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BANK_ID=repomate
GITHUB_TOKEN=your_optional_github_token
PORT=8080
```

---

## 🏃 Quick Start Guide

### 1. Run the Backend Server
```bash
cd backend
npm start
```
*The server will start on `http://localhost:8080`.*

### 2. Run the React Frontend
```bash
cd frontend
npm run dev
```
*The UI will open on `http://localhost:5173`.*

### 3. Run Automated Tests
```bash
cd backend
npm test
```
*Runs all 6 verification tests (Hindsight connection, memory store, memory retrieve, RAG query, Agent reasoning, feedback loop).*

### 4. Run the 1-Minute End-to-End Demo Script
```bash
cd backend
node lib/testEndToEndDemo.js
```

---

## 📡 API Reference

### 1. Health Status
`GET /status`
```json
{
  "status": "online",
  "service": "GitHub RepoMate AI Engineering Agent",
  "hindsightBank": "REPOMATE"
}
```

### 2. Index Repository
`POST /add-repo`
```json
{
  "githubURL": "https://github.com/ZayeemMohd/taskflowAI",
  "githubToken": "optional-token"
}
```

### 3. Ask RepoMate Agent
`POST /ask-question`
```json
{
  "UserQuery": "Why am I getting ERR_MODULE_NOT_FOUND?"
}
```
**Response:**
```json
{
  "msg": "query amswered sucessfully",
  "AI_Summary": "### Problem Understanding\n...\n### Root Cause\n...\n### Recommended Fix\n...\n### Past Engineering Experience (Hindsight)\n...",
  "relevantFiles": [
    {
      "fileName": "server.js",
      "similarityScore": 0.68
    }
  ],
  "memoriesUsed": [
    {
      "text": "ERR_MODULE_NOT_FOUND was fixed by adding .js to the local ES module import.",
      "outcome": "SUCCESS",
      "lesson": "Always add .js extension when importing local files in an ES module project."
    }
  ],
  "agentResponse": "...",
  "details": {
    "problem": "...",
    "rootCause": "...",
    "relevantFile": "...",
    "recommendedFix": "...",
    "explanation": "...",
    "previousExperience": "...",
    "verification": "..."
  }
}
```

### 4. Submit Feedback (Learning Loop)
`POST /feedback`
```json
{
  "question": "Why am I getting ERR_MODULE_NOT_FOUND?",
  "answer": "Add .js to the local ES module import.",
  "solved": true,
  "notes": "Adding .js to server.js resolved the error.",
  "repository": "https://github.com/ZayeemMohd/taskflowAI",
  "file": "server.js"
}
```
**Response:**
```json
{
  "message": "Feedback stored in Hindsight",
  "success": true,
  "outcome": "SUCCESS",
  "lesson": "When addressing problem: 'Why am I getting ERR_MODULE_NOT_FOUND?', the solution was confirmed effective."
}
```

### 5. Memory Vault
`GET /memories?q=query`
Returns all historical engineering experiences and outcomes stored in Hindsight memory.

---

## 🎬 1-Minute Hackathon Demonstration Script

1. **Step 1 — Ingestion**: Provide repository URL and click **"Analyze Repository"**.
2. **Step 2 — Encounter Bug**: Ask: *"Why am I getting ERR_MODULE_NOT_FOUND in my ES module script?"*.
3. **Step 3 — Agent Response**: RepoMate inspects `package.json` (`"type": "module"`) and recommends adding `.js` extensions.
4. **Step 4 — Feedback**: Click **"✓ Solved"** and enter notes. Click **"Submit Experience"**.
   - *Hindsight retains the memory with Outcome: SUCCESS.*
5. **Step 5 — Memory-Assisted Assistance**: Ask: *"How do I fix local file import errors in Node.js ES modules?"*.
6. **Step 6 — Learning Demonstrated**:
   - RepoMate retrieves the previous experience.
   - Highlights: **Outcome: SUCCESS**.
   - Agent validates against the current repository:
     > *"A previous engineering experience suggests adding .js to local imports. I inspected the current repository and verified it uses ECMAScript modules (`"type": "module"`). Therefore, that previous experience applies directly."*
