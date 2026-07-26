import React from "react";
import {
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Code,
  Laptop,
} from "lucide-react";

export const KnowledgeBase: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
        <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Surge 5 Official Documentation & Reference Guide</span>
        </h2>
        <p className="text-xs text-slate-400">
          Official guidelines for Surge 5 on iOS and macOS, rule semantics, DNS architecture, and policy group mechanics.
        </p>
      </div>

      {/* Official Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://manual.nssurge.com/"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Surge Manual</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-[11px] text-slate-400">
            Authoritative reference for configuration syntax, options, and rules.
          </p>
        </a>

        <a
          href="https://kb.nssurge.com/surge-knowledge-base/"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Knowledge Base</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <p className="text-[11px] text-slate-400">
            Tutorials, step-by-step guides, troubleshooting, and FAQs.
          </p>
        </a>

        <a
          href="https://nssurge.com/mac/latest/appcast-signed-beta.xml"
          target="_blank"
          rel="noreferrer"
          className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center space-x-2">
              <Code className="w-4 h-4 text-purple-400" />
              <span>Release & Appcast Log</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-[11px] text-slate-400">
            Latest beta releases, new feature additions, and bug fixes.
          </p>
        </a>
      </div>

      {/* Manual Sections Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white font-mono border-b border-slate-800 pb-3">
          Surge 5 Architecture Quick Reference
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-bold text-blue-400">1. Sequential Rule Evaluation</h4>
            <p className="text-slate-300 font-sans">
              Surge evaluates rules from top to bottom. The first matching rule immediately dictates the policy assignment. Place specific rules (<code className="text-blue-300">DOMAIN</code>, <code className="text-blue-300">DOMAIN-SUFFIX</code>) before broad rules (<code className="text-blue-300">GEOIP</code>, <code className="text-blue-300">FINAL</code>).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-bold text-emerald-400">2. Fake-IP & Encrypted DNS</h4>
            <p className="text-slate-300 font-sans">
              Surge assigns synthetic IP addresses (198.18.0.0/15) to domains to defer real DNS resolution to remote proxies, preventing local DNS leaks and speeding up connection setup.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-bold text-purple-400">3. Policy Groups</h4>
            <p className="text-slate-300 font-sans">
              <strong className="text-slate-200">url-test:</strong> Periodically pings nodes against a benchmark URL and automatically routes through the node with the lowest latency.<br />
              <strong className="text-slate-200">fallback:</strong> Uses the primary node unless it fails, falling back down the list.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-bold text-amber-400">4. macOS Process Matching</h4>
            <p className="text-slate-300 font-sans">
              On macOS, <code className="text-amber-300">PROCESS-NAME</code> matches outbound connections by client application (e.g. <code className="text-amber-300">Slack</code>, <code className="text-amber-300">Xcode</code>, <code className="text-amber-300">Termius</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
