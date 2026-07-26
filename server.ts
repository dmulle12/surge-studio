import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initializer for Gemini AI
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Surge 5 Studio", timestamp: new Date().toISOString() });
});

// AI Endpoint: Generate Surge Rules or Complete Profiles
app.post("/api/ai/generate-rules", async (req, res) => {
  try {
    const { prompt, targetSystem, existingConfig } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are an expert Surge 5 (iOS and macOS) configuration specialist.
Your task is to generate valid, clean, optimized Surge 5 rule sets or .conf configuration snippets based on user requirements.
Follow official Surge 5 syntax guidelines:
- Rule types: DOMAIN, DOMAIN-SUFFIX, DOMAIN-KEYWORD, DOMAIN-SET, IP-CIDR, IP-CIDR6, GEOIP, PROCESS-NAME, USER-AGENT, URL-REGEX, RULE-SET, AND, OR, NOT, FINAL.
- Policy options: DIRECT, REJECT, Reject-Tiny-Gif, or user-defined Proxy Groups/Proxies.
- Additional flags: no-resolve, extended-matching.
- Section tags: [General], [Replica], [Proxy], [Proxy Group], [Rule], [Host], [URL Rewrite], [Header Rewrite], [MITM], [Script].

Always return JSON format with fields:
- rules: array of string rule lines (e.g. ["DOMAIN-SUFFIX,openai.com,Proxy-US", "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve"])
- confSnippet: string formatted full or partial configuration block
- explanation: brief high-level summary of what was generated and why
- warnings: array of optional warning strings if any potential conflicts exist`;

    const userMessage = `Target Platform: ${targetSystem || "iOS & macOS"}
User Requirement: ${prompt}
${existingConfig ? `Existing Config Context:\n${existingConfig.slice(0, 2000)}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userMessage,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error in /api/ai/generate-rules:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to generate rules" });
  }
});

// AI Endpoint: Config Audit & Diagnostic Engine
app.post("/api/ai/audit-config", async (req, res) => {
  try {
    const { configText, targetPlatform } = req.body;
    if (!configText) {
      return res.status(400).json({ success: false, error: "Missing configText" });
    }

    const ai = getGenAI();
    const systemInstruction = `You are a senior Surge 5 network auditor.
Analyze the provided Surge 5 configuration file (.conf) for iOS / macOS.
Identify:
1. Syntax errors or illegal options (e.g., PROCESS-NAME used on iOS without macOS tag, invalid IP-CIDR, missing FINAL rule).
2. DNS Leak risks (e.g., DNS servers missing DoH/Encrypted-DNS, missing no-resolve on GEOIP or IP-CIDR rules causing unwanted DNS queries).
3. Routing performance issues (e.g., redundant rules, improper order of DOMAIN vs DOMAIN-SUFFIX, high url-test intervals).
4. Security & Privacy gaps (e.g. wildcard MITM hostname "*", exposed HTTP listening port without auth).

Return JSON format:
{
  "score": number (0-100),
  "summary": "string overview",
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "section": "[General]" | "[Proxy]" | "[Rule]" | "[MITM]" | etc.,
      "line": string or line number reference,
      "message": "string explanation",
      "suggestion": "string proposed fix"
    }
  ],
  "optimizedSnippet": "string optimized snippet or full config"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Platform: ${targetPlatform || "iOS & macOS"}\n\nConfiguration Content:\n${configText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error in /api/ai/audit-config:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to audit configuration" });
  }
});

// AI Endpoint: Surge Script Generator ($request, $response, $httpClient)
app.post("/api/ai/generate-script", async (req, res) => {
  try {
    const { taskDescription, scriptType } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are an expert developer of Surge 5 JavaScript scripts (.js) and Surge Modules (.sgmodule).
Surge scripts run in a lightweight JavaScript sandbox with global objects:
- $request: { url, method, headers, body }
- $response: { status, headers, body }
- $done({ status, headers, body, url }) or $done({})
- $httpClient: { get({url, headers}, cb), post(...), put(...), delete(...) }
- $notification.post(title, subtitle, body)
- $persistentStore.read(key), $persistentStore.write(val, key)

Generate production-ready Surge JS script and matching [Script] or [Module] declaration line.

Return JSON format:
{
  "scriptCode": "string valid JavaScript code",
  "declarationLine": "string Surge config declaration e.g. ScriptName = type=http-response,pattern=...,script-path=...",
  "moduleSnippet": "string full .sgmodule format",
  "usageNotes": "string clear instructions on how to install and test"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Script Type: ${scriptType || "http-response"}\nGoal: ${taskDescription}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error in /api/ai/generate-script:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to generate script" });
  }
});

// AI Endpoint: Knowledge & Manual Q&A
app.post("/api/ai/ask-doc", async (req, res) => {
  try {
    const { question } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are the official Surge 5 Knowledge Base Assistant for iOS and macOS.
Provide accurate, technical, highly helpful answers based on Surge 5 capabilities:
- High performance HTTP/HTTPS/SOCKS5/Shadowsocks/VMess/Trojan/TUIC/Hysteria2/WireGuard proxy protocols.
- Advanced DNS features: Fake-IP (198.18.0.0/15), DoH (DNS-over-HTTPS), DoT, QUIC DNS, hijacking, mapped hosts.
- Rules & Policy Groups: Select, URL-Test, Fallback, Load-Balance, Sub-Group.
- MITM, Header Rewrite, URL Rewrite, Local DNS Server, Router Mode (macOS Network Extension & Gateway mode).
- Latest iOS & macOS differences (e.g., PROCESS-NAME is macOS only, WireGuard TUN differences).

Keep responses structured with markdown, code examples, and clear rule examples.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: question,
      config: {
        systemInstruction,
      },
    });

    res.json({ success: true, answer: response.text });
  } catch (err: any) {
    console.error("Error in /api/ai/ask-doc:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to answer question" });
  }
});

// Vite Middleware & Static Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Surge 5 Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
