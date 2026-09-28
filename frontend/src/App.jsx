import React, { useState, useEffect } from "react";
import {
  Brain,
  GitBranch,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Database,
  ArrowRight,
  Code2,
  AlertTriangle,
  History,
  Cpu,
  Layers,
  Send,
  RefreshCw,
  Copy,
  Check,
  User,
  Workflow,
  TrendingUp,
  FileCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("workspace"); // 'workspace' | 'pipeline' | 'memories'
  const [githubURL, setGithubURL] = useState("https://github.com/ZayeemMohd/taskflowAI");
  const [githubToken, setGithubToken] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState(null);

  // Question & Answer state
  const [userQuery, setUserQuery] = useState("Why am I getting ERR_MODULE_NOT_FOUND in my ES module script?");
  const [isAsking, setIsAsking] = useState(false);
  const [answerData, setAnswerData] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Feedback state
  const [solvedStatus, setSolvedStatus] = useState(null); // true | false
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);

  // Pipeline active stage
  const [activeStage, setActiveStage] = useState("idle"); 
  // 'idle' | 'repo_ingest' | 'code_summarize' | 'embeddings' | 'dual_retrieve' | 'agent_reason' | 'developer_answer' | 'feedback_store' | 'improved_assistance'

  // Stored memories vault
  const [allMemories, setAllMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(false);

  // Server health
  const [serverHealth, setServerHealth] = useState(null);

  // Check health on mount
  useEffect(() => {
    fetchHealth();
    fetchMemories();
  }, []);

  // Resilient multi-tier API caller (Vite proxy -> 127.0.0.1:8080 -> localhost:8080)
  const apiRequest = async (path, options = {}) => {
    try {
      const res = await fetch(`/api${path}`, options);
      if (res.ok || res.status < 500) return res;
    } catch {}

    try {
      const res = await fetch(`http://127.0.0.1:8080${path}`, options);
      if (res.ok || res.status < 500) return res;
    } catch {}

    return fetch(`http://localhost:8080${path}`, options);
  };

  const fetchHealth = async () => {
    try {
      const res = await apiRequest("/status");
      const data = await res.json();
      setServerHealth(data);
    } catch {
      setServerHealth({ status: "offline" });
    }
  };

  const fetchMemories = async () => {
    setLoadingMemories(true);
    try {
      const res = await apiRequest("/memories?q=error+debugging+module");
      const data = await res.json();
      setAllMemories(data.memories || []);
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setLoadingMemories(false);
    }
  };

  // Index Repository
  const handleIndexRepo = async (e) => {
    e.preventDefault();
    if (!githubURL) return;

    setIsIndexing(true);
    setIndexStatus(null);
    setActiveStage("repo_ingest");

    try {
      const res = await apiRequest("/add-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubURL, githubToken }),
      });
      const data = await res.json();

      if (res.ok) {
        setIndexStatus({
          type: "success",
          message: data.message || `Successfully indexed ${data.filesIndexed || ""} repository files!`,
        });
        setActiveStage("embeddings");
      } else {
        setIndexStatus({
          type: "error",
          message: data.error || "Failed to index repository",
        });
        setActiveStage("idle");
      }
    } catch (err) {
      setIndexStatus({
        type: "error",
        message: "Cannot connect to backend server. Make sure port 8080 is running.",
      });
      setActiveStage("idle");
    } finally {
      setIsIndexing(false);
    }
  };

  // Ask Question
  const handleAskQuestion = async (overrideQuery) => {
    const query = overrideQuery || userQuery;
    if (!query) return;

    setIsAsking(true);
    setAnswerData(null);
    setFeedbackResult(null);
    setSolvedStatus(null);
    setFeedbackNotes("");
    setActiveStage("dual_retrieve");

    try {
      const res = await apiRequest("/ask-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserQuery: query }),
      });
      const data = await res.json();

      if (res.ok) {
        setAnswerData(data);
        setActiveStage("developer_answer");
        fetchMemories();
      } else {
        alert(data.error || "Failed to get response");
        setActiveStage("idle");
      }
    } catch (err) {
      alert("Error contacting backend agent: " + err.message);
      setActiveStage("idle");
    } finally {
      setIsAsking(false);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async () => {
    if (solvedStatus === null) {
      alert("Please select whether the solution was Solved or Not Solved.");
      return;
    }

    setIsSubmittingFeedback(true);
    setActiveStage("feedback_store");

    try {
      const res = await apiRequest("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuery,
          answer: answerData?.details?.recommendedFix || answerData?.AI_Summary || "Recommended fix provided",
          solved: solvedStatus,
          notes: feedbackNotes,
          repository: githubURL,
          file: answerData?.details?.relevantFile || "",
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedbackResult({
          type: "success",
          message: "Your experience has been saved to RepoMate memory.",
          outcome: data.outcome,
          lesson: data.lesson,
        });
        setActiveStage("improved_assistance");
        fetchMemories();
      } else {
        setFeedbackResult({
          type: "error",
          message: data.error || "Failed to save feedback",
        });
      }
    } catch (err) {
      setFeedbackResult({
        type: "error",
        message: "Network error saving feedback: " + err.message,
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px" }}>
      {/* Top Navbar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "rgba(17, 23, 38, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
            }}
          >
            <Brain size={26} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                GitHub <span style={{ color: "#818cf8" }}>RepoMate</span>
              </h1>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#a5b4fc",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  fontWeight: "600",
                }}
              >
                Hindsight Memory Agent
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Retrieves repository context & learns from engineering experiences
            </p>
          </div>
        </div>

        {/* Status Indicators & Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              background: "var(--bg-tertiary)",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: serverHealth?.status === "online" ? "#10b981" : "#f43f5e",
                display: "inline-block",
              }}
            />
            <span style={{ color: "var(--text-muted)" }}>Memory Bank:</span>
            <strong style={{ color: "#a5b4fc", fontFamily: "var(--font-mono)" }}>
              {serverHealth?.hindsightBank || "REPOMATE"}
            </strong>
          </div>

          {/* MongoDB Database Status Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              background: "var(--bg-tertiary)",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <Database size={13} color={serverHealth?.mongoDB?.connected ? "#10b981" : "#f59e0b"} />
            <span style={{ color: "var(--text-muted)" }}>MongoDB:</span>
            <strong
              style={{
                color: serverHealth?.mongoDB?.connected ? "#34d399" : "#fbbf24",
                fontFamily: "var(--font-mono)",
              }}
            >
              {serverHealth?.mongoDB?.connected
                ? `Connected (${serverHealth.mongoDB.documentsCount || 0})`
                : "Active (Local Fallback)"}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              background: "var(--bg-secondary)",
              borderRadius: "10px",
              padding: "3px",
              border: "1px solid var(--border-color)",
            }}
          >
            <button
              onClick={() => setActiveTab("workspace")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                background: activeTab === "workspace" ? "var(--accent-primary)" : "transparent",
                color: activeTab === "workspace" ? "#fff" : "var(--text-muted)",
              }}
            >
              Agent Workspace
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                background: activeTab === "pipeline" ? "var(--accent-primary)" : "transparent",
                color: activeTab === "pipeline" ? "#fff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Workflow size={14} />
              Architecture Flow
            </button>
            <button
              onClick={() => {
                setActiveTab("memories");
                fetchMemories();
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                background: activeTab === "memories" ? "var(--accent-primary)" : "transparent",
                color: activeTab === "memories" ? "#fff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Database size={14} />
              Memory Vault ({allMemories.length})
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: WORKSPACE */}
      {activeTab === "workspace" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          {/* Quick Flow Breadcrumb Tracker */}
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "10px 18px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontWeight: "700", color: "#818cf8", display: "flex", alignItems: "center", gap: "6px" }}>
                <Workflow size={14} /> Current Pipeline State:
              </span>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: "700",
                  fontFamily: "var(--font-mono)",
                  background:
                    activeStage === "idle"
                      ? "rgba(100, 116, 139, 0.2)"
                      : activeStage === "repo_ingest" || activeStage === "code_summarize"
                      ? "rgba(6, 182, 212, 0.2)"
                      : activeStage === "dual_retrieve" || activeStage === "agent_reason"
                      ? "rgba(139, 92, 246, 0.2)"
                      : activeStage === "developer_answer"
                      ? "rgba(99, 102, 241, 0.2)"
                      : "rgba(16, 185, 129, 0.2)",
                  color:
                    activeStage === "idle"
                      ? "#94a3b8"
                      : activeStage === "repo_ingest" || activeStage === "code_summarize"
                      ? "#22d3ee"
                      : activeStage === "dual_retrieve" || activeStage === "agent_reason"
                      ? "#c084fc"
                      : activeStage === "developer_answer"
                      ? "#a5b4fc"
                      : "#34d399",
                  border: "1px solid currentColor",
                }}
              >
                {activeStage === "idle" && "READY / STANDBY"}
                {activeStage === "repo_ingest" && "1. LOADING & SUMMARIZING REPOSITORY..."}
                {activeStage === "embeddings" && "2. VECTOR STORAGE READY (embeddings.json)"}
                {activeStage === "dual_retrieve" && "3. PARALLEL RAG + HINDSIGHT RECALL..."}
                {activeStage === "developer_answer" && "4. AI AGENT REASONING COMPLETED"}
                {activeStage === "feedback_store" && "5. STORING EXPERIENCE IN HINDSIGHT..."}
                {activeStage === "improved_assistance" && "6. EXPERIENCE RETAINED FOR FUTURE ASSISTANCE ✓"}
              </span>
            </div>
            <button
              onClick={() => setActiveTab("pipeline")}
              style={{
                background: "transparent",
                color: "#818cf8",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: "600",
              }}
            >
              Inspect Flow Diagram <ArrowRight size={14} />
            </button>
          </div>

          {/* Step 1: Repository Input Card */}
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "13px",
                }}
              >
                1
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Repository Input & Vector Storage</h2>
            </div>

            <form onSubmit={handleIndexRepo}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 260px auto", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={githubURL}
                    onChange={(e) => setGithubURL(e.target.value)}
                    placeholder="https://github.com/user/repository"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    GitHub Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxx (for private repos)"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    type="submit"
                    disabled={isIndexing}
                    style={{
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                      color: "#fff",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                      opacity: isIndexing ? 0.7 : 1,
                    }}
                  >
                    {isIndexing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Indexing Files...
                      </>
                    ) : (
                      <>
                        <GitBranch size={16} />
                        Analyze Repository
                      </>
                    )}
                  </button>
                </div>
              </div>

              {indexStatus && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background:
                      indexStatus.type === "success"
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(244, 63, 94, 0.1)",
                    border: `1px solid ${
                      indexStatus.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"
                    }`,
                    color: indexStatus.type === "success" ? "#34d399" : "#fb7185",
                  }}
                >
                  {indexStatus.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{indexStatus.message}</span>
                </div>
              )}
            </form>
          </div>

          {/* Step 2: Question Section */}
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(139, 92, 246, 0.15)",
                    color: "#a78bfa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "13px",
                  }}
                >
                  2
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Ask RepoMate AI Agent (RAG + Hindsight)</h2>
              </div>

              {/* Quick sample chips for Hackathon demo */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-subtle)" }}>Quick Demo Prompts:</span>
                <button
                  type="button"
                  onClick={() => {
                    setUserQuery("Why am I getting ERR_MODULE_NOT_FOUND in my ES module script?");
                  }}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "#a5b4fc",
                    borderRadius: "6px",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                  }}
                >
                  💡 ERR_MODULE_NOT_FOUND
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserQuery("How do I fix local file import errors in Node.js ES modules?");
                  }}
                  style={{
                    fontSize: "11px",
                    padding: "4px 10px",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "#a5b4fc",
                    borderRadius: "6px",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                  }}
                >
                  🔁 Memory-Assisted Query
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                placeholder="Ask about errors, architecture, functions, or implementation..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                }}
              />
              <button
                type="button"
                onClick={() => handleAskQuestion()}
                disabled={isAsking}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  color: "#fff",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                  opacity: isAsking ? 0.7 : 1,
                }}
              >
                {isAsking ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Agent Reasoning...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Ask Agent
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3: AI Answer & Memory Experience Section */}
          {answerData && (
            <div className="animate-fade-in" style={{ display: "grid", gap: "20px" }}>
              {/* Star Card: Hindsight Memory Card */}
              {answerData.memoriesUsed && answerData.memoriesUsed.length > 0 && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(49, 46, 129, 0.7) 100%)",
                    border: "1px solid rgba(129, 140, 248, 0.4)",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "rgba(165, 180, 252, 0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#c7d2fe",
                        }}
                      >
                        <History size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#e0e7ff" }}>
                          Hindsight Memory: Past Experiences Recalled
                        </h3>
                        <p style={{ fontSize: "12px", color: "#a5b4fc" }}>
                          Recalled from bank <code>{serverHealth?.hindsightBank || "REPOMATE"}</code> and cross-examined with repository code
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        background: "rgba(16, 185, 129, 0.2)",
                        color: "#6ee7b7",
                        fontWeight: "700",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      {answerData.memoriesUsed.length} Memory Found
                    </span>
                  </div>

                  {answerData.memoriesUsed.map((mem, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(15, 23, 42, 0.7)",
                        padding: "14px 18px",
                        borderRadius: "10px",
                        marginBottom: idx < answerData.memoriesUsed.length - 1 ? "10px" : "0",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "700",
                            background:
                              mem.outcome === "SUCCESS"
                                ? "rgba(16, 185, 129, 0.2)"
                                : "rgba(244, 63, 94, 0.2)",
                            color: mem.outcome === "SUCCESS" ? "#34d399" : "#fb7185",
                          }}
                        >
                          Outcome: {mem.outcome || "SUCCESS"}
                        </span>
                        {mem.file && (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            File: {mem.file}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>{mem.text}</p>
                      {mem.lesson && (
                        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", fontStyle: "italic" }}>
                          💡 Lesson: {mem.lesson}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Agent's Verification Reasoning */}
                  {answerData.details?.verification && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "rgba(99, 102, 241, 0.18)",
                        border: "1px solid rgba(99, 102, 241, 0.35)",
                      }}
                    >
                      <strong style={{ fontSize: "12px", color: "#a5b4fc", display: "block", marginBottom: "4px" }}>
                        Agent Verification & Why This Applies:
                      </strong>
                      <p style={{ fontSize: "13px", color: "#e2e8f0" }}>{answerData.details.verification}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Main AI Solution Card */}
              <div
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                {/* Problem Understanding & Root Cause */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div
                    style={{
                      background: "var(--bg-secondary)",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <AlertTriangle size={16} color="#f59e0b" />
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fbbf24" }}>Problem Understanding</h4>
                    </div>
                    <p style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: "1.6" }}>
                      {answerData.details?.problem || "Identified runtime or syntax issue in codebase."}
                    </p>
                  </div>

                  <div
                    style={{
                      background: "var(--bg-secondary)",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <Cpu size={16} color="#f43f5e" />
                      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#fb7185" }}>Root Cause</h4>
                    </div>
                    <p style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: "1.6" }}>
                      {answerData.details?.rootCause || "Root cause identified via repository analysis."}
                    </p>
                  </div>
                </div>

                {/* Relevant Files from RAG */}
                {answerData.relevantFiles && answerData.relevantFiles.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                      Relevant Repository Files (Cosine Similarity)
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {answerData.relevantFiles.map((f, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            background: "var(--bg-secondary)",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            fontSize: "12px",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <Code2 size={13} color="#818cf8" />
                          <span style={{ color: "#fff" }}>{f.fileName}</span>
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(99, 102, 241, 0.2)",
                              color: "#a5b4fc",
                            }}
                          >
                            {(f.similarityScore * 100).toFixed(1)}% match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Fix */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={16} />
                      Recommended Fix
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          answerData.details?.recommendedFix || answerData.AI_Summary || ""
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        padding: "4px 10px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "6px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {copiedCode ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                      {copiedCode ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <pre
                    style={{
                      background: "#05070d",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                    }}
                  >
                    {answerData.details?.recommendedFix || answerData.agentResponse || answerData.AI_Summary}
                  </pre>
                </div>

                {/* Why This Fix Works */}
                {answerData.details?.explanation && (
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "10px",
                      background: "rgba(16, 185, 129, 0.06)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      marginBottom: "24px",
                    }}
                  >
                    <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#34d399", marginBottom: "6px" }}>
                      Why This Fix Works
                    </h4>
                    <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>
                      {answerData.details.explanation}
                    </p>
                  </div>
                )}

                {/* Step 4: Developer Feedback Section (The Learning Loop) */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    borderRadius: "12px",
                    padding: "18px 22px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
                    Did this solution solve your problem?
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Your feedback trains RepoMate's Hindsight memory bank so future answers become even smarter.
                  </p>

                  <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                    <button
                      type="button"
                      onClick={() => setSolvedStatus(true)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background:
                          solvedStatus === true ? "#10b981" : "rgba(16, 185, 129, 0.12)",
                        color: solvedStatus === true ? "#fff" : "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      <CheckCircle2 size={16} />
                      ✓ Solved
                    </button>

                    <button
                      type="button"
                      onClick={() => setSolvedStatus(false)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background:
                          solvedStatus === false ? "#f43f5e" : "rgba(244, 63, 94, 0.12)",
                        color: solvedStatus === false ? "#fff" : "#fb7185",
                        border: "1px solid rgba(244, 63, 94, 0.4)",
                      }}
                    >
                      <XCircle size={16} />
                      ✗ Not Solved
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="text"
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      placeholder="Additional feedback notes (e.g. Solved on Windows, or required extra flag)..."
                      style={{
                        flex: 1,
                        padding: "8px 14px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSubmitFeedback}
                      disabled={isSubmittingFeedback || solvedStatus === null}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: "var(--accent-primary)",
                        color: "#fff",
                        opacity: isSubmittingFeedback || solvedStatus === null ? 0.5 : 1,
                      }}
                    >
                      {isSubmittingFeedback ? "Saving Memory..." : "Submit Experience"}
                    </button>
                  </div>

                  {feedbackResult && (
                    <div
                      className="animate-fade-in"
                      style={{
                        marginTop: "14px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background:
                          feedbackResult.type === "success"
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(244, 63, 94, 0.15)",
                        border: `1px solid ${
                          feedbackResult.type === "success"
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(244, 63, 94, 0.3)"
                        }`,
                        color: feedbackResult.type === "success" ? "#34d399" : "#fb7185",
                        fontSize: "13px",
                      }}
                    >
                      <strong>{feedbackResult.message}</strong>
                      {feedbackResult.lesson && (
                        <div style={{ fontSize: "12px", marginTop: "4px", color: "#cbd5e1" }}>
                          Saved Lesson: {feedbackResult.lesson}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE ARCHITECTURE PIPELINE */}
      {activeTab === "pipeline" && (
        <div className="animate-fade-in" style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "28px",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 30px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#a5b4fc",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}
              >
                <Workflow size={14} /> System Execution Architecture
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>
                RepoMate Dual-Branch Retrieval & Learning Pipeline
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                Visual map of how GitHub RepoMate connects Codebase Ingestion, Dual-Source RAG, AI Agent Reasoning, and Hindsight Memory Retention.
              </p>
            </div>

            {/* Visual Node Diagram */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                position: "relative",
              }}
            >
              {/* NODE 1: USER */}
              <div
                style={{
                  width: "280px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1e293b, #0f172a)",
                  border: "2px solid #64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(100, 116, 139, 0.2)", color: "#cbd5e1" }}>
                  <User size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "14px", display: "block" }}>USER</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Developer asking technical query</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 2: GitHub Repository URL */}
              <div
                style={{
                  width: "320px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                  <GitBranch size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>GitHub Repository URL</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Input repository target</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 3: GitHub Repo Loader */}
              <div
                style={{
                  width: "320px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
                  <Layers size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>GitHub Repo Loader</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>LangChain Document Loader</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 4: Repository Source Code */}
              <div
                style={{
                  width: "320px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(139, 92, 246, 0.15)", color: "#a855f7" }}>
                  <FileCode size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>Repository Source Code</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Parsed file buffers & AST content</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 5: File Summarization */}
              <div
                style={{
                  width: "320px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>File Summarization</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Gemini Flash file abstractions</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 6: Embeddings */}
              <div
                style={{
                  width: "320px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                  <Cpu size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>Embeddings</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>gemini-embedding-001 (3072 dims)</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 7: Vector Storage (embeddings.json) */}
              <div
                style={{
                  width: "360px",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                  border: "2px solid #6366f1",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
                }}
              >
                <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.3)", color: "#a5b4fc" }}>
                  <Database size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: "14px", display: "block", color: "#e0e7ff" }}>
                    Vector Storage (embeddings.json)
                  </strong>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Codebase indexed vectors & summaries</span>
                </div>
              </div>

              {/* SPLIT BRANCHES: Current Repo RAG vs Hindsight Memory */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", width: "100%", maxWidth: "780px", marginTop: "10px" }}>
                {/* Branch A: Current Repository RAG */}
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(6, 182, 212, 0.15)", color: "#22d3ee" }}>
                    <Search size={20} />
                  </div>
                  <strong style={{ fontSize: "14px", color: "#67e8f9" }}>Current Repository RAG</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Cosine similarity query matching against current codebase files
                  </span>
                  <div
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(6, 182, 212, 0.1)",
                      color: "#22d3ee",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    queryCodebase.js
                  </div>
                </div>

                {/* Branch B: Hindsight Memory Past Experiences */}
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "rgba(30, 27, 75, 0.8)",
                    border: "1px solid rgba(168, 85, 247, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                    <History size={20} />
                  </div>
                  <strong style={{ fontSize: "14px", color: "#d8b4fe" }}>Hindsight Memory Past Experiences</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Recalls previous debugging lessons, successful solutions & failed attempts
                  </span>
                  <div
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(168, 85, 247, 0.1)",
                      color: "#c084fc",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    retrieveMemory.js
                  </div>
                </div>
              </div>

              {/* MERGING ARROW */}
              <div style={{ height: "20px", width: "2px", background: "#818cf8" }} />

              {/* NODE 8: AI Agent */}
              <div
                style={{
                  width: "360px",
                  padding: "16px 22px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #3730a3, #4338ca)",
                  border: "2px solid #818cf8",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "0 6px 20px rgba(99, 102, 241, 0.3)",
                }}
              >
                <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.15)", color: "#fff" }}>
                  <Brain size={24} />
                </div>
                <div>
                  <strong style={{ fontSize: "15px", display: "block", color: "#fff" }}>RepoMate AI Agent</strong>
                  <span style={{ fontSize: "12px", color: "#e0e7ff" }}>
                    Cross-examines code vs past experiences (repoMateAgent.js)
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 9: Gemini */}
              <div
                style={{
                  width: "320px",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(244, 63, 94, 0.15)", color: "#f43f5e" }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>Google Gemini LLM</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Reasoning & solution synthesis</span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 10: Developer Answer */}
              <div
                style={{
                  width: "340px",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: "14px", display: "block", color: "#34d399" }}>Developer Answer</strong>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Root cause, recommended fix, and verified memory relevance
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 11: Developer Feedback Branch (Solved vs Not Solved) */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "540px",
                  padding: "18px 22px",
                  borderRadius: "14px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  textAlign: "center",
                }}
              >
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "12px" }}>
                  Developer Feedback Loop
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#34d399",
                      fontSize: "12px",
                    }}
                  >
                    <strong>✓ Solved</strong>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Outcome: SUCCESS memory
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.3)",
                      color: "#fb7185",
                      fontSize: "12px",
                    }}
                  >
                    <strong>✗ Not Solved</strong>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Outcome: FAILED memory
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#475569" }} />

              {/* NODE 12: Hindsight Memory Bank */}
              <div
                style={{
                  width: "360px",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                  border: "2px solid #818cf8",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.3)", color: "#a5b4fc" }}>
                  <History size={22} />
                </div>
                <div>
                  <strong style={{ fontSize: "14px", display: "block", color: "#e0e7ff" }}>
                    Hindsight Memory Bank
                  </strong>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>
                    Retains lessons & solutions for institutional engineering memory
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div style={{ height: "20px", width: "2px", background: "#10b981" }} />

              {/* NODE 13: Improved Future Assistance */}
              <div
                style={{
                  width: "380px",
                  padding: "16px 22px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(6, 78, 59, 0.8), rgba(6, 95, 70, 0.6))",
                  border: "2px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.25)",
                }}
              >
                <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.3)", color: "#6ee7b7" }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <strong style={{ fontSize: "15px", display: "block", color: "#ecfdf5" }}>
                    Improved Future Assistance
                  </strong>
                  <span style={{ fontSize: "12px", color: "#a7f3d0" }}>
                    Smarter contextual answers on similar problems!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HINDSIGHT MEMORY VAULT */}
      {activeTab === "memories" && (
        <div className="animate-fade-in" style={{ display: "grid", gap: "20px" }}>
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Database size={20} color="#818cf8" />
                  RepoMate Long-Term Memory Vault
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Institutional engineering memories stored in Hindsight Bank: <code>{serverHealth?.hindsightBank || "REPOMATE"}</code>
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMemories}
                disabled={loadingMemories}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  color: "#fff",
                  fontSize: "13px",
                }}
              >
                <RefreshCw size={14} className={loadingMemories ? "animate-spin" : ""} />
                Refresh Memories
              </button>
            </div>

            {loadingMemories ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                Loading memories from Hindsight...
              </div>
            ) : allMemories.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                No engineering memories recorded yet. Ask a question and submit feedback to save your first experience!
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {allMemories.map((mem, index) => (
                  <div
                    key={index}
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      padding: "16px 20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: "700",
                          background:
                            mem.outcome === "SUCCESS"
                              ? "rgba(16, 185, 129, 0.2)"
                              : "rgba(244, 63, 94, 0.2)",
                          color: mem.outcome === "SUCCESS" ? "#34d399" : "#fb7185",
                        }}
                      >
                        {mem.outcome || "EXPERIENCE"}
                      </span>
                      {mem.file && (
                        <span style={{ fontSize: "12px", color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                          File: {mem.file}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: "14px", color: "#f1f5f9", marginBottom: "8px", lineHeight: "1.5" }}>
                      {mem.text}
                    </p>

                    {mem.lesson && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#94a3b8",
                          background: "var(--bg-primary)",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid rgba(255, 255, 255, 0.04)",
                        }}
                      >
                        💡 <strong>Lesson:</strong> {mem.lesson}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
