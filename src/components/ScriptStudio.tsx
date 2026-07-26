import React, { useState } from "react";
import {
  FileCode,
  Play,
  CheckCircle,
  Code,
  Terminal,
  Sparkles,
  Zap,
} from "lucide-react";

const SAMPLE_SCRIPTS = [
  {
    name: "Header Injector ($request)",
    type: "http-request",
    code: `// Surge 5 HTTP Request Script
// Modifies or injects request headers before forwarding
let headers = $request.headers;

// Inject custom User-Agent and Authorization header
headers['User-Agent'] = 'Surge/5.0 (iPhone; iOS 17.5)';
headers['X-Surge-Injected'] = 'True';

console.log('Modified request headers for URL: ' + $request.url);

$done({ headers });
`,
  },
  {
    name: "JSON Response Injector ($response)",
    type: "http-response",
    code: `// Surge 5 HTTP Response Script
// Modifies JSON response body
let body = $response.body;

if (body) {
  try {
    let obj = JSON.parse(body);
    obj.unlocked_vip = true;
    obj.premium_status = "active_pro";
    body = JSON.stringify(obj);
    console.log("Successfully injected VIP payload into JSON response");
  } catch(e) {
    console.log("Error parsing response JSON: " + e.message);
  }
}

$done({ body });
`,
  },
  {
    name: "Notification Alert Trigger",
    type: "event",
    code: `// Surge 5 Event & Notification Script
// Sends native iOS/macOS system notification banner
let title = "Surge 5 Security Alert";
let subtitle = "Rule Matched";
let body = "Encrypted DoH session successfully initialized.";

$notification.post(title, subtitle, body);
console.log("Notification posted to OS banner");

$done({});
`,
  },
];

export const ScriptStudio: React.FC = () => {
  const [scriptCode, setScriptCode] = useState(SAMPLE_SCRIPTS[0].code);
  const [scriptType, setScriptType] = useState(SAMPLE_SCRIPTS[0].type);

  // Mock Input State
  const [mockUrl, setMockUrl] = useState("https://api.example.com/v1/user/profile");
  const [mockMethod, setMockMethod] = useState("GET");
  const [mockReqHeaders, setMockReqHeaders] = useState('{"Accept": "application/json"}');
  const [mockResponseBody, setMockResponseBody] = useState('{"user_id": 1001, "premium_status": "free"}');

  // Execution Output State
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [doneResult, setDoneResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunScript = () => {
    setIsExecuting(true);
    const logs: string[] = [];
    let capturedDone: any = null;

    // Build synthetic Surge global environment
    let parsedReqHeaders = {};
    try {
      parsedReqHeaders = JSON.parse(mockReqHeaders);
    } catch (_e) {}

    const $request = {
      url: mockUrl,
      method: mockMethod,
      headers: parsedReqHeaders,
      body: "",
    };

    const $response = {
      status: 200,
      headers: { "content-type": "application/json" },
      body: mockResponseBody,
    };

    const customConsole = {
      log: (...args: any[]) => logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ")),
      error: (...args: any[]) => logs.push("[ERROR] " + args.join(" ")),
    };

    const $done = (res: any) => {
      capturedDone = res;
    };

    const $notification = {
      post: (title: string, sub: string, msg: string) => {
        logs.push(`[NOTIFICATION] ${title} - ${sub}: ${msg}`);
      },
    };

    try {
      // Evaluate script in isolated Function scope
      const runner = new Function(
        "$request",
        "$response",
        "$done",
        "$notification",
        "console",
        scriptCode
      );

      runner($request, $response, $done, $notification, customConsole);

      setConsoleLogs(logs);
      setDoneResult(capturedDone || { status: "Done with no returned payload" });
    } catch (e: any) {
      logs.push("[RUN TIME ERROR] " + e.message);
      setConsoleLogs(logs);
      setDoneResult({ error: e.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
        <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <span>Surge 5 JavaScript Scripting Studio ($request / $response)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Simulate Surge JavaScript scripts with live execution of $request, $response, $done(), and $notification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Script Editor & Samples */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                Load Sample Snippet:
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {SAMPLE_SCRIPTS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setScriptCode(s.code);
                    setScriptType(s.type);
                  }}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-blue-300 text-xs transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white font-mono flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Script Code (.js)</span>
              </span>

              <button
                onClick={handleRunScript}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Script</span>
              </button>
            </div>

            <textarea
              rows={16}
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-blue-300 outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Mock Input Parameters & Output Console */}
        <div className="space-y-4">
          {/* Mock Input Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs font-mono shadow-xl">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Mock Request / Response Input Context</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block mb-0.5">Mock URL ($request.url)</label>
                <input
                  type="text"
                  value={mockUrl}
                  onChange={(e) => setMockUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Method</label>
                <input
                  type="text"
                  value={mockMethod}
                  onChange={(e) => setMockMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">
                Mock Response Body ($response.body)
              </label>
              <textarea
                rows={3}
                value={mockResponseBody}
                onChange={(e) => setMockResponseBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Execution Results Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs font-mono shadow-xl">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Execution Output & $done() Return Payload</span>
            </h3>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">$done() Result Payload:</span>
              <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-emerald-300 min-h-[70px] overflow-x-auto">
                {doneResult ? JSON.stringify(doneResult, null, 2) : "Click Execute Script to test."}
              </pre>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Console Logs:</span>
              <div className="bg-slate-950 border border-slate-800 rounded p-3 min-h-[90px] text-slate-300 space-y-1">
                {consoleLogs.length === 0 ? (
                  <span className="text-slate-600 italic">No console logs yet.</span>
                ) : (
                  consoleLogs.map((log, i) => <div key={i}>➔ {log}</div>)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
