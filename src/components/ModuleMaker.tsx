import React, { useState } from "react";
import { SurgeModule } from "../types";
import { PRESET_MODULES } from "../data/presetModules";
import {
  Package,
  Plus,
  Check,
  Copy,
  Download,
  CheckSquare,
  Square,
  Code,
  Shield,
  Zap,
  Sparkles,
} from "lucide-react";

export const ModuleMaker: React.FC = () => {
  const [modules, setModules] = useState<SurgeModule[]>(PRESET_MODULES);
  const [selectedModule, setSelectedModule] = useState<SurgeModule>(PRESET_MODULES[0]);
  const [copied, setCopied] = useState(false);

  // New Custom Module State
  const [customName, setCustomName] = useState("My Custom Surge Module");
  const [customDesc, setCustomDesc] = useState("Modular extension for Surge 5");
  const [customSystem, setCustomSystem] = useState<"mac" | "ios" | "all">("all");
  const [customCode, setCustomCode] = useState(`[Rule]\nDOMAIN-SUFFIX,mycustomdomain.com,DIRECT\n`);

  const toggleModule = (id: string) => {
    setModules(
      modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const activeCombinedCode = modules
    .filter((m) => m.enabled)
    .map((m) => m.code)
    .join("\n\n# ----------------------------------------\n\n");

  const handleCopyCombined = () => {
    navigator.clipboard.writeText(activeCombinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadModule = (mod: SurgeModule) => {
    const blob = new Blob([mod.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mod.name.replace(/\s+/g, "_")}.sgmodule`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCustomModule = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = `#!name=${customName}
#!desc=${customDesc}
#!system=${customSystem === "all" ? "mac,ios" : customSystem}

${customCode}
`;

    const newMod: SurgeModule = {
      id: `custom_mod_${Date.now()}`,
      name: customName,
      description: customDesc,
      category: "Security",
      system: customSystem,
      author: "User Custom",
      version: "1.0.0",
      enabled: true,
      code: generatedCode,
    };

    setModules([newMod, ...modules]);
    setSelectedModule(newMod);
    alert("Custom Surge 5 Module created!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
        <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-400" />
          <span>Surge 5 Module Manager & Gallery (.sgmodule)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Surge Modules allow modular enabling of rules, scripts, and MITM directives without modifying the primary config.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery / Module Cards Column */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
            Curated Surge Modules
          </h3>

          <div className="space-y-2.5">
            {modules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedModule.id === mod.id
                    ? "bg-slate-800 border-blue-500/60 shadow-lg"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(mod.id);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {mod.enabled ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <span className="text-xs font-bold text-white font-mono">
                      {mod.name}
                    </span>
                  </div>

                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                    {mod.category}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                  {mod.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 font-mono pt-2 border-t border-slate-800/60">
                  <span>By {mod.author}</span>
                  <span>v{mod.version}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Module Viewer / Custom Creator Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Code Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  <span>{selectedModule.name} (.sgmodule)</span>
                </h3>
                <p className="text-xs text-slate-400">{selectedModule.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadModule(selectedModule)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sgmodule</span>
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-blue-300 leading-relaxed overflow-x-auto">
              {selectedModule.code}
            </pre>
          </div>

          {/* Custom Module Creator Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Create Custom Surge Module</span>
            </h3>

            <form onSubmit={handleCreateCustomModule} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Module Name (#!name)</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Target System (#!system)</label>
                  <select
                    value={customSystem}
                    onChange={(e) => setCustomSystem(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                  >
                    <option value="all">Universal (mac & ios)</option>
                    <option value="mac">macOS Only</option>
                    <option value="ios">iOS Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description (#!desc)</label>
                <input
                  type="text"
                  required
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Module Directives Body ([Rule], [Script], [General])</label>
                <textarea
                  rows={5}
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg"
              >
                Build & Save Module
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
