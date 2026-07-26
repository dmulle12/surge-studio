import React from "react";
import {
  ShieldCheck,
  Cpu,
  Smartphone,
  Laptop,
  Layers,
  Download,
  Copy,
  Sparkles,
  Zap,
  Check,
} from "lucide-react";
import { PlatformTarget, PresetProfile } from "../types";

interface NavbarProps {
  platform: PlatformTarget;
  setPlatform: (p: PlatformTarget) => void;
  activePresetId: string;
  presetProfiles: PresetProfile[];
  onSelectPreset: (p: PresetProfile) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  ruleCount: number;
  proxyCount: number;
  mitmEnabled: boolean;
  onExportConfig: () => void;
  onCopyInstallUrl: () => void;
  copiedUrl: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  platform,
  setPlatform,
  activePresetId,
  presetProfiles,
  onSelectPreset,
  activeTab,
  setActiveTab,
  ruleCount,
  proxyCount,
  mitmEnabled,
  onExportConfig,
  onCopyInstallUrl,
  copiedUrl,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                Surge <span className="text-blue-400">5</span> Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                v5.8.0 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-Performance Proxy & Rule Routing Framework for iOS & macOS
            </p>
          </div>
        </div>

        {/* Platform Selector & Preset Loader */}
        <div className="flex items-center space-x-3">
          {/* Target System Toggle */}
          <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 flex items-center space-x-1">
            <button
              onClick={() => setPlatform("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                platform === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Universal</span>
            </button>
            <button
              onClick={() => setPlatform("ios")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                platform === "ios"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iOS</span>
            </button>
            <button
              onClick={() => setPlatform("macos")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                platform === "macos"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>macOS</span>
            </button>
          </div>

          {/* Preset Profiles Dropdown */}
          <select
            value={activePresetId}
            onChange={(e) => {
              const selected = presetProfiles.find((p) => p.id === e.target.value);
              if (selected) onSelectPreset(selected);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {presetProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                Preset: {p.name}
              </option>
            ))}
          </select>

          {/* Export & One-Click Install */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onCopyInstallUrl}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors flex items-center space-x-1.5"
              title="Copy Surge One-Click Install URL (surge:///install-config)"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-blue-400" />
                  <span>Surge URL</span>
                </>
              )}
            </button>

            <button
              onClick={onExportConfig}
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-medium shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .conf</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Header Engine Status Indicators & Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Navigation Workspace Tabs */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: "profile", label: "Profile Editor (.conf)", icon: "📄" },
              { id: "rules", label: `Rule Matrix (${ruleCount})`, icon: "🔀" },
              { id: "simulator", label: "Routing Trace Simulator", icon: "🧪" },
              { id: "modules", label: "Surge Modules (.sgmodule)", icon: "📦" },
              { id: "scripting", label: "Scripting Sandbox", icon: "📜" },
              { id: "ai", label: "AI Config Assistant", icon: "🤖" },
              { id: "docs", label: "Surge Manual & KB", icon: "📚" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Engine Status Pills */}
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1 bg-emerald-950/60 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Tun Engine: Active</span>
            </span>
            <span className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span>Proxies: {proxyCount} Nodes</span>
            </span>
            <span className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>MitM: {mitmEnabled ? "Enabled" : "Off"}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
