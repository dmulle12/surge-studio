import React, { useState } from "react";
import {
  SurgeParsedConfig,
  SurgeGeneralConfig,
  SurgeProxy,
  SurgePolicyGroup,
  SurgeHostEntry,
  SurgeUrlRewriteEntry,
  ProxyType,
  PolicyGroupType,
} from "../types";
import { serializeSurgeConfig, parseSurgeConfig } from "../utils/surgeParser";
import {
  Code,
  Sliders,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Zap,
  Globe,
  Shield,
  FileCode,
  Terminal,
} from "lucide-react";

interface ProfileEditorProps {
  config: SurgeParsedConfig;
  onChangeConfig: (newConfig: SurgeParsedConfig) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  config,
  onChangeConfig,
}) => {
  const [viewMode, setViewMode] = useState<"form" | "raw">("form");
  const [formSection, setFormSection] = useState<
    "general" | "proxy" | "policyGroup" | "host" | "urlRewrite" | "mitm" | "script"
  >("general");

  const [rawText, setRawText] = useState<string>(serializeSurgeConfig(config));
  const [rawError, setRawError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync raw text when config changes externally
  React.useEffect(() => {
    setRawText(serializeSurgeConfig(config));
  }, [config]);

  const handleApplyRawText = () => {
    try {
      const parsed = parseSurgeConfig(rawText);
      onChangeConfig(parsed);
      setRawError(null);
      alert("Configuration parsed and applied successfully!");
    } catch (e: any) {
      setRawError("Failed to parse configuration: " + e.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Surge5.conf";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helpers for editing General Config
  const updateGeneralField = (field: keyof SurgeGeneralConfig, val: any) => {
    const updatedGeneral = { ...config.general, [field]: val };
    const updatedConfig = { ...config, general: updatedGeneral };
    onChangeConfig(updatedConfig);
  };

  // Proxy Management Helpers
  const addProxyNode = () => {
    const newProxy: SurgeProxy = {
      id: `proxy_${Date.now()}`,
      name: `US-Node-${config.proxies.length + 1}`,
      type: "hysteria2",
      server: "us.proxy-server.net",
      port: 8443,
      parameters: { password: "secure_token" },
      rawLine: "",
    };
    onChangeConfig({
      ...config,
      proxies: [...config.proxies, newProxy],
    });
  };

  const deleteProxyNode = (id: string) => {
    onChangeConfig({
      ...config,
      proxies: config.proxies.filter((p) => p.id !== id),
    });
  };

  const updateProxyNode = (id: string, updated: Partial<SurgeProxy>) => {
    onChangeConfig({
      ...config,
      proxies: config.proxies.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    });
  };

  // Policy Group Management Helpers
  const addPolicyGroup = () => {
    const newGroup: SurgePolicyGroup = {
      id: `group_${Date.now()}`,
      name: `Policy-Group-${config.policyGroups.length + 1}`,
      type: "url-test",
      proxies: config.proxies.map((p) => p.name),
      url: "http://cp.cloudflare.com/generate_204",
      interval: 300,
      tolerance: 50,
      rawLine: "",
    };
    onChangeConfig({
      ...config,
      policyGroups: [...config.policyGroups, newGroup],
    });
  };

  const deletePolicyGroup = (id: string) => {
    onChangeConfig({
      ...config,
      policyGroups: config.policyGroups.filter((g) => g.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Editor Header / Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono">
              Surge Profile Editor (.conf)
            </h2>
            <p className="text-xs text-slate-400">
              Edit configuration visually with real-time validation or modify raw
              Surge syntax
            </p>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode("form")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              viewMode === "form"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Visual Form</span>
          </button>
          <button
            onClick={() => {
              setRawText(serializeSurgeConfig(config));
              setViewMode("raw");
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              viewMode === "raw"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw Syntax (.conf)</span>
          </button>
        </div>
      </div>

      {/* FORM VIEW */}
      {viewMode === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation Side Tabs */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 h-fit">
            {[
              { id: "general", label: "[General] Settings", icon: Zap },
              { id: "proxy", label: `[Proxy] Nodes (${config.proxies.length})`, icon: Globe },
              { id: "policyGroup", label: `[Proxy Group] (${config.policyGroups.length})`, icon: Sliders },
              { id: "host", label: `[Host] DNS Maps (${config.hosts.length})`, icon: Terminal },
              { id: "urlRewrite", label: `[URL Rewrite] (${config.urlRewrites.length})`, icon: FileCode },
              { id: "mitm", label: "[MITM] Decryption", icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setFormSection(item.id as any)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-2.5 ${
                    formSection === item.id
                      ? "bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Content Panel */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            {/* GENERAL SECTION */}
            {formSection === "general" && (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>[General] System & Network Parameters</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure DNS servers, listen ports, bypass lists, and synthetic IP modes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Log Level</label>
                    <select
                      value={config.general.loglevel || "notify"}
                      onChange={(e) => updateGeneralField("loglevel", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="verbose">verbose (Full Debug)</option>
                      <option value="info">info</option>
                      <option value="notify">notify (Default)</option>
                      <option value="warning">warning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">HTTP Listen Port</label>
                    <input
                      type="text"
                      value={config.general.httpListenPort || "6152"}
                      onChange={(e) => updateGeneralField("httpListenPort", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Standard DNS Servers</label>
                    <input
                      type="text"
                      value={config.general.dnsServer || "223.5.5.5, 119.29.29.29, 1.1.1.1"}
                      onChange={(e) => updateGeneralField("dnsServer", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Encrypted DNS (DoH URLs)</label>
                    <input
                      type="text"
                      value={config.general.encryptedDnsServer || "https://dns.nextdns.io/dns-query"}
                      onChange={(e) => updateGeneralField("encryptedDnsServer", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 mb-1 font-medium">Skip Proxy List (bypass domains/IPs)</label>
                    <textarea
                      rows={2}
                      value={config.general.skipProxy || "127.0.0.1, 192.168.0.0/16, localhost"}
                      onChange={(e) => updateGeneralField("skipProxy", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none focus:border-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Hijack DNS Servers</label>
                    <input
                      type="text"
                      value={config.general.hijackDns || "8.8.8.8:53, 8.8.4.4:53"}
                      onChange={(e) => updateGeneralField("hijackDns", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Always Real IP (Do not Fake-IP)</label>
                    <input
                      type="text"
                      value={config.general.alwaysRealIp || "*.srv.nintendo.net, msftconnecttest.com"}
                      onChange={(e) => updateGeneralField("alwaysRealIp", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-3 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.general.allowWifiAccess || false}
                      onChange={(e) => updateGeneralField("allowWifiAccess", e.target.checked)}
                      className="rounded text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Allow LAN WiFi Access</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-3 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.general.hideVpnIcon || false}
                      onChange={(e) => updateGeneralField("hideVpnIcon", e.target.checked)}
                      className="rounded text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Hide VPN Icon (iOS)</span>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-3 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.general.showPrimaryIntraIp || false}
                      onChange={(e) => updateGeneralField("showPrimaryIntraIp", e.target.checked)}
                      className="rounded text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-300">Show Primary Intra IP</span>
                  </label>
                </div>
              </div>
            )}

            {/* PROXY SECTION */}
            {formSection === "proxy" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>[Proxy] Remote Servers & Protocols</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Supports Hysteria2, Trojan, VMess, Shadowsocks, TUIC, WireGuard, SOCKS5, HTTP.
                    </p>
                  </div>

                  <button
                    onClick={addProxyNode}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Proxy Node</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {config.proxies.map((proxy) => (
                    <div
                      key={proxy.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={proxy.name}
                            onChange={(e) => updateProxyNode(proxy.id, { name: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-slate-100 font-mono text-xs font-bold w-48"
                            placeholder="Proxy Node Name"
                          />
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40 uppercase">
                            {proxy.type}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteProxyNode(proxy.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Proxy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {proxy.type !== "direct" && proxy.type !== "reject" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">Protocol Type</label>
                            <select
                              value={proxy.type}
                              onChange={(e) => updateProxyNode(proxy.id, { type: e.target.value as ProxyType })}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                            >
                              <option value="hysteria2">hysteria2</option>
                              <option value="trojan">trojan</option>
                              <option value="vmess">vmess</option>
                              <option value="shadowsocks">shadowsocks</option>
                              <option value="tuic">tuic</option>
                              <option value="wireguard">wireguard</option>
                              <option value="https">https</option>
                              <option value="socks5">socks5</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">Server Domain / IP</label>
                            <input
                              type="text"
                              value={proxy.server || ""}
                              onChange={(e) => updateProxyNode(proxy.id, { server: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] mb-0.5">Port</label>
                            <input
                              type="number"
                              value={proxy.port || 443}
                              onChange={(e) => updateProxyNode(proxy.id, { port: parseInt(e.target.value, 10) })}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POLICY GROUP SECTION */}
            {formSection === "policyGroup" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <span>[Proxy Group] Auto-Test, Select & Fallback Rules</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Group nodes into auto-latency tests, select groups, or fallback failovers.
                    </p>
                  </div>

                  <button
                    onClick={addPolicyGroup}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Policy Group</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {config.policyGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => {
                              const updated = config.policyGroups.map((g) =>
                                g.id === group.id ? { ...g, name: e.target.value } : g
                              );
                              onChangeConfig({ ...config, policyGroups: updated });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 font-mono font-bold text-slate-100"
                          />
                          <select
                            value={group.type}
                            onChange={(e) => {
                              const updated = config.policyGroups.map((g) =>
                                g.id === group.id
                                  ? { ...g, type: e.target.value as PolicyGroupType }
                                  : g
                              );
                              onChangeConfig({ ...config, policyGroups: updated });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-blue-400 font-mono"
                          >
                            <option value="select">select (Manual Switch)</option>
                            <option value="url-test">url-test (Auto Speed Test)</option>
                            <option value="fallback">fallback (Auto Failover)</option>
                            <option value="load-balance">load-balance</option>
                          </select>
                        </div>

                        <button
                          onClick={() => deletePolicyGroup(group.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] mb-1">
                          Group Nodes (comma separated)
                        </label>
                        <input
                          type="text"
                          value={group.proxies.join(", ")}
                          onChange={(e) => {
                            const proxies = e.target.value.split(",").map((s) => s.trim());
                            const updated = config.policyGroups.map((g) =>
                              g.id === group.id ? { ...g, proxies } : g
                            );
                            onChangeConfig({ ...config, policyGroups: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-slate-200"
                        />
                      </div>

                      {group.type === "url-test" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Test URL</span>
                            <input
                              type="text"
                              value={group.url || "http://cp.cloudflare.com/generate_204"}
                              onChange={(e) => {
                                const updated = config.policyGroups.map((g) =>
                                  g.id === group.id ? { ...g, url: e.target.value } : g
                                );
                                onChangeConfig({ ...config, policyGroups: updated });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                            />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Interval (sec)</span>
                            <input
                              type="number"
                              value={group.interval || 300}
                              onChange={(e) => {
                                const updated = config.policyGroups.map((g) =>
                                  g.id === group.id
                                    ? { ...g, interval: parseInt(e.target.value, 10) }
                                    : g
                                );
                                onChangeConfig({ ...config, policyGroups: updated });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                            />
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Tolerance (ms)</span>
                            <input
                              type="number"
                              value={group.tolerance || 50}
                              onChange={(e) => {
                                const updated = config.policyGroups.map((g) =>
                                  g.id === group.id
                                    ? { ...g, tolerance: parseInt(e.target.value, 10) }
                                    : g
                                );
                                onChangeConfig({ ...config, policyGroups: updated });
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MITM & HOST & URL REWRITE SECTIONS */}
            {formSection === "mitm" && (
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>[MITM] Man-in-the-Middle Decryption Hostnames</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure TLS decryption targets for HTTPS script injection and body rewrites.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Decrypted Hostnames</label>
                  <textarea
                    rows={3}
                    value={config.mitm.hostname.join(", ")}
                    onChange={(e) => {
                      const list = e.target.value.split(",").map((s) => s.trim());
                      onChangeConfig({
                        ...config,
                        mitm: { ...config.mitm, hostname: list },
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono"
                    placeholder="*.openai.com, *.claude.ai"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.mitm.h2 || false}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          mitm: { ...config.mitm, h2: e.target.checked },
                        })
                      }
                      className="rounded text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300">Enable HTTP/2 (h2)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.mitm.tcpConnection || false}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          mitm: { ...config.mitm, tcpConnection: e.target.checked },
                        })
                      }
                      className="rounded text-blue-500 focus:ring-blue-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300">TCP Connection Decryption</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAW CODE VIEW */}
      {viewMode === "raw" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white font-mono">Surge Configuration Syntax (.conf)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleApplyRawText}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Sync Code to Visual Form</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy Raw"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .conf</span>
              </button>
            </div>
          </div>

          {rawError && (
            <div className="bg-rose-950/80 border border-rose-800/80 rounded-lg p-3 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{rawError}</span>
            </div>
          )}

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={22}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-blue-300 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};
