import React, { useState } from "react";
import { SurgeParsedConfig, SurgeRule, AuditResult } from "../types";
import { parseSurgeConfig } from "../utils/surgeParser";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Send,
  Plus,
  RefreshCw,
  HelpCircle,
  Code,
  Zap,
} from "lucide-react";

interface AiAssistantProps {
  config: SurgeParsedConfig;
  onChangeConfig: (newConfig: SurgeParsedConfig) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  config,
  onChangeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<"generator" | "audit" | "qa">("generator");

  // Rule Generator State
  const [genPrompt, setGenPrompt] = useState(
    "Route all OpenAI, Anthropic Claude, and Midjourney requests through US-Proxy, force Netflix through HK-Proxy, keep domestic .cn sites DIRECT, and block doubleclick ads."
  );
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<any | null>(null);

  // Config Audit State
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Q&A State
  const [qaQuestion, setQaQuestion] = useState("How does Fake-IP work in Surge 5 and when should I use always-real-ip?");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);

  // AI Rule Generation Request
  const handleGenerateRules = async () => {
    if (!genPrompt.trim()) return;
    setGenLoading(true);
    try {
      const response = await fetch("/api/ai/generate-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: genPrompt,
          existingConfig: config.rawText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGenResult(data.result);
      } else {
        alert("AI Error: " + data.error);
      }
    } catch (e: any) {
      alert("Failed to connect to AI server: " + e.message);
    } finally {
      setGenLoading(false);
    }
  };

  // Add AI Generated Rules to Config
  const handleApplyGeneratedRules = () => {
    if (!genResult || !genResult.rules) return;

    const newRules: SurgeRule[] = genResult.rules.map((rStr: string, idx: number) => {
      const tokens = rStr.split(",").map((s) => s.trim());
      const type = (tokens[0] || "DOMAIN-SUFFIX").toUpperCase() as any;
      const value = tokens[1] || "";
      const policy = tokens[2] || "DIRECT";

      return {
        id: `ai_rule_${Date.now()}_${idx}`,
        type,
        value,
        policy,
        noResolve: tokens.includes("no-resolve"),
        rawLine: rStr,
        enabled: true,
      };
    });

    const finalIdx = config.rules.findIndex((r) => r.type === "FINAL");
    let updatedRules: SurgeRule[] = [];
    if (finalIdx !== -1) {
      updatedRules = [
        ...config.rules.slice(0, finalIdx),
        ...newRules,
        ...config.rules.slice(finalIdx),
      ];
    } else {
      updatedRules = [...config.rules, ...newRules];
    }

    onChangeConfig({
      ...config,
      rules: updatedRules,
    });

    alert(`Successfully added ${newRules.length} AI generated rules to your Surge configuration!`);
  };

  // Run Configuration Audit
  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const response = await fetch("/api/ai/audit-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          configText: config.rawText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAuditResult(data.result);
      } else {
        alert("Audit Error: " + data.error);
      }
    } catch (e: any) {
      alert("Failed to run audit: " + e.message);
    } finally {
      setAuditLoading(false);
    }
  };

  // Q&A Request
  const handleAskQa = async () => {
    if (!qaQuestion.trim()) return;
    setQaLoading(true);
    try {
      const response = await fetch("/api/ai/ask-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: qaQuestion,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setQaAnswer(data.answer);
      } else {
        alert("Q&A Error: " + data.error);
      }
    } catch (e: any) {
      alert("Failed to ask question: " + e.message);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <span>Surge 5 AI Assistant</span>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                Gemini 3.6 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generate rules, audit configuration security, and ask Surge 5 technical manual questions.
            </p>
          </div>
        </div>

        {/* AI Tab Buttons */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === "generator"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rule Generator</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Audit</span>
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === "qa"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Surge Manual Q&A</span>
          </button>
        </div>
      </div>

      {/* GENERATOR TAB */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Natural Language Rule & Policy Generator
            </h3>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder="Describe what rules you want to generate in plain English..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleGenerateRules}
                disabled={genLoading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {genLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Surge 5 Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Surge Rules with Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {genResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Generated Surge Rules ({genResult.rules?.length || 0})</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{genResult.explanation}</p>
                </div>

                <button
                  onClick={handleApplyGeneratedRules}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Append Rules to Config</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 font-mono text-xs text-blue-300">
                {genResult.rules?.map((ruleLine: string, idx: number) => (
                  <div key={idx} className="py-0.5 border-b border-slate-900/60 last:border-0">
                    {ruleLine}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Configuration Security & Performance Audit</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Analyzes current profile for DNS leaks, syntax errors, and routing bottlenecks.
                </p>
              </div>

              <button
                onClick={handleRunAudit}
                disabled={auditLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center space-x-2 disabled:opacity-50"
              >
                {auditLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Profile...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run Security Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {auditResult && (
            <div className="space-y-4">
              {/* Score Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center space-x-5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono text-white shadow-xl ${
                    auditResult.score >= 80
                      ? "bg-emerald-600"
                      : auditResult.score >= 60
                      ? "bg-amber-600"
                      : "bg-rose-600"
                  }`}
                >
                  {auditResult.score}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    Profile Quality Score: {auditResult.score}/100
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">{auditResult.summary}</p>
                </div>
              </div>

              {/* Issues List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Audit Findings ({auditResult.issues.length})
                </h4>

                <div className="space-y-2">
                  {auditResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs font-mono space-y-1 ${
                        issue.severity === "critical"
                          ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
                          : issue.severity === "warning"
                          ? "bg-amber-950/40 border-amber-800/80 text-amber-200"
                          : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider">
                          [{issue.severity}] {issue.section}
                        </span>
                        {issue.line && (
                          <span className="text-[10px] text-slate-400">Line: {issue.line}</span>
                        )}
                      </div>
                      <p className="font-sans text-xs">{issue.message}</p>
                      <p className="text-[11px] text-indigo-300 italic">
                        💡 Suggestion: {issue.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL Q&A TAB */}
      {activeTab === "qa" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Surge 5 Knowledge Base & Manual Q&A</span>
          </h3>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                placeholder="Ask any technical question about Surge 5..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAskQa}
                disabled={qaLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                {qaLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {qaAnswer && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-sans text-slate-200 leading-relaxed space-y-2">
                <div className="font-mono text-[11px] font-bold text-indigo-400">
                  Surge 5 Knowledge Response:
                </div>
                <div className="whitespace-pre-wrap">{qaAnswer}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
