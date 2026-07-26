import React, { useState } from "react";
import { SurgeParsedConfig, TrafficTestInput, TraceResult } from "../types";
import { simulateSurgeRouting } from "../utils/surgeSimulator";
import {
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Globe,
  Zap,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";

interface RoutingSimulatorProps {
  config: SurgeParsedConfig;
}

export const RoutingSimulator: React.FC<RoutingSimulatorProps> = ({ config }) => {
  const [input, setInput] = useState<TrafficTestInput>({
    url: "https://api.openai.com/v1/chat/completions",
    ip: "104.244.42.1",
    processName: "Slack",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    sourceIp: "192.168.1.105",
  });

  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);

  const handleRunTrace = () => {
    const res = simulateSurgeRouting(config, input);
    setTraceResult(res);
  };

  // Run initial trace on mount
  React.useEffect(() => {
    handleRunTrace();
  }, [config]);

  const loadPresetTraffic = (preset: Partial<TrafficTestInput>) => {
    const updated = { ...input, ...preset };
    setInput(updated);
    setTraceResult(simulateSurgeRouting(config, updated));
  };

  return (
    <div className="space-y-6">
      {/* Header & Preset Scenarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Surge 5 Live Routing Simulator & Trace Diagnostic</span>
            </h2>
            <p className="text-xs text-slate-400">
              Simulate traffic requests against active rulesets to verify DNS, Policy Group selections, and rule order.
            </p>
          </div>

          <button
            onClick={handleRunTrace}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Simulate Traffic Route</span>
          </button>
        </div>

        {/* Quick Traffic Test Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-mono text-slate-400 block font-semibold">
            Quick Scenario Presets:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              {
                label: "🤖 OpenAI / ChatGPT API",
                url: "https://api.openai.com/v1/chat/completions",
                processName: "Safari",
              },
              {
                label: "🍿 Netflix 4K Stream",
                url: "https://www.netflix.com/title/80018050",
                processName: "Netflix",
              },
              {
                label: "💬 Slack macOS Client",
                url: "https://slack.com/api/rtm.connect",
                processName: "Slack",
              },
              {
                label: "🛍️ Taobao Domestic CN",
                url: "https://www.taobao.com/search",
                processName: "Chrome",
              },
              {
                label: "🍎 Apple TestFlight",
                url: "https://testflight.apple.com/v1",
                processName: "TestFlight",
              },
              {
                label: "🚫 Doubleclick Ad Server",
                url: "https://ad.doubleclick.net/ad/N1234",
                processName: "Safari",
              },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPresetTraffic({ url: p.url, processName: p.processName })}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-slate-800">
          <div>
            <label className="block text-slate-400 text-[10px] mb-1">Target URL / Domain</label>
            <input
              type="text"
              value={input.url}
              onChange={(e) => setInput({ ...input, url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] mb-1">Destination IP</label>
            <input
              type="text"
              value={input.ip}
              onChange={(e) => setInput({ ...input, ip: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] mb-1">Client Process (macOS)</label>
            <input
              type="text"
              value={input.processName}
              onChange={(e) => setInput({ ...input, processName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] mb-1">User-Agent Header</label>
            <input
              type="text"
              value={input.userAgent}
              onChange={(e) => setInput({ ...input, userAgent: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* TRACE RESULT DISPLAY */}
      {traceResult && (
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Matched Rule Card */}
            <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 shadow-xl space-y-1">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-bold tracking-wider">
                Winning Match Rule
              </span>
              <div className="text-sm font-bold text-white font-mono truncate">
                {traceResult.matchedRule?.type},{traceResult.matchedRule?.value || "[Catch-All]"}
              </div>
              <span className="text-xs text-slate-400 font-mono block">
                Target Policy: <strong className="text-blue-300">{traceResult.matchedRule?.policy}</strong>
              </span>
            </div>

            {/* Final Proxy Node Card */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-xl space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                Selected Node / Action
              </span>
              <div className="text-sm font-bold text-emerald-300 font-mono truncate">
                {traceResult.finalNode}
              </div>
              <span className="text-xs text-slate-400 font-mono block">
                Est. Latency: <strong className="text-emerald-400">{traceResult.simulatedLatencyMs}ms</strong>
              </span>
            </div>

            {/* Resolved IP & DNS Mode Card */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 shadow-xl space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                Resolved Address
              </span>
              <div className="text-sm font-bold text-purple-300 font-mono truncate">
                {traceResult.resolvedIp}
              </div>
              <span className="text-xs text-slate-400 font-mono block">
                DNS Mode: <strong className="text-purple-300">{traceResult.dnsType}</strong>
              </span>
            </div>

            {/* Policy Resolution Path Card */}
            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-xl space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                Policy Routing Path
              </span>
              <div className="text-xs font-bold text-indigo-200 font-mono flex items-center space-x-1 overflow-x-auto py-0.5">
                {traceResult.policyPath.map((node, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />}
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 whitespace-nowrap">
                      {node}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Sequential Evaluation Trace Waterfall */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Sequential Rule Evaluation Waterfall ({traceResult.steps.length} Steps)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Executed at {traceResult.timestamp}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
              {traceResult.steps.map((step) => (
                <div
                  key={step.stepIndex}
                  className={`p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                    step.matched
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/20"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-400 opacity-70"
                  }`}
                >
                  <div className="mt-0.5">
                    {step.matched ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-400">
                          Step #{step.stepIndex}
                        </span>
                        <span className="font-bold text-slate-100">
                          {step.rule.type},{step.rule.value || "*"}
                        </span>
                        <span className="text-slate-400">➔ {step.rule.policy}</span>
                      </div>

                      {step.matched && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded text-[10px] uppercase tracking-wider">
                          Matched & Triggered
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 italic">{step.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
