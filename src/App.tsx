import React, { useState } from "react";
import { PlatformTarget, SurgeParsedConfig, SurgeRule, PresetProfile } from "./types";
import { PRESET_PROFILES } from "./data/presetProfiles";
import { parseSurgeConfig, serializeSurgeConfig } from "./utils/surgeParser";
import { Navbar } from "./components/Navbar";
import { ProfileEditor } from "./components/ProfileEditor";
import { RuleBuilder } from "./components/RuleBuilder";
import { RoutingSimulator } from "./components/RoutingSimulator";
import { ModuleMaker } from "./components/ModuleMaker";
import { ScriptStudio } from "./components/ScriptStudio";
import { AiAssistant } from "./components/AiAssistant";
import { KnowledgeBase } from "./components/KnowledgeBase";

export default function App() {
  const [platform, setPlatform] = useState<PlatformTarget>("ios");
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [activePreset, setActivePreset] = useState<PresetProfile>(PRESET_PROFILES[0]);

  // Main active parsed Surge configuration state
  const [config, setConfig] = useState<SurgeParsedConfig>(() =>
    parseSurgeConfig(PRESET_PROFILES[0].rawConfig)
  );

  const [copiedUrl, setCopiedUrl] = useState(false);

  // Handle preset selection
  const handleSelectPreset = (p: PresetProfile) => {
    setActivePreset(p);
    setPlatform(p.targetPlatform);
    setConfig(parseSurgeConfig(p.rawConfig));
  };

  // Handle configuration update
  const handleChangeConfig = (newConfig: SurgeParsedConfig) => {
    setConfig(newConfig);
  };

  // Handle rules update
  const handleChangeRules = (newRules: SurgeRule[]) => {
    setConfig({
      ...config,
      rules: newRules,
    });
  };

  // Download .conf file
  const handleExportConfig = () => {
    const rawText = serializeSurgeConfig(config);
    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.general.loglevel || "Surge5"}_profile.conf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy One-Click Surge Install URL
  const handleCopyInstallUrl = () => {
    const rawText = serializeSurgeConfig(config);
    const encoded = encodeURIComponent(rawText);
    const surgeUrl = `surge:///install-config?url=${encodeURIComponent(
      window.location.origin
    )}&raw=${encoded.slice(0, 500)}`;

    navigator.clipboard.writeText(surgeUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* App Navbar */}
      <Navbar
        platform={platform}
        setPlatform={setPlatform}
        activePresetId={activePreset.id}
        presetProfiles={PRESET_PROFILES}
        onSelectPreset={handleSelectPreset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ruleCount={config.rules.length}
        proxyCount={config.proxies.length}
        mitmEnabled={config.mitm.hostname.length > 0}
        onExportConfig={handleExportConfig}
        onCopyInstallUrl={handleCopyInstallUrl}
        copiedUrl={copiedUrl}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "profile" && (
          <ProfileEditor config={config} onChangeConfig={handleChangeConfig} />
        )}

        {activeTab === "rules" && (
          <RuleBuilder config={config} onChangeRules={handleChangeRules} />
        )}

        {activeTab === "simulator" && <RoutingSimulator config={config} />}

        {activeTab === "modules" && <ModuleMaker />}

        {activeTab === "scripting" && <ScriptStudio />}

        {activeTab === "ai" && (
          <AiAssistant config={config} onChangeConfig={handleChangeConfig} />
        )}

        {activeTab === "docs" && <KnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Surge 5 Studio • Rule-Based Routing Suite for iOS & macOS</span>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Rules Compiled: {config.rules.length}</span>
            <span className="text-slate-400">Proxy Nodes: {config.proxies.length}</span>
            <span className="text-slate-400">Engine: v5.8.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
