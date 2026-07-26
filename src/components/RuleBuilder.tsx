import React, { useState } from "react";
import { SurgeRule, RuleType, SurgeParsedConfig } from "../types";
import {
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  X,
  Sliders,
  Filter,
  Layers,
  Sparkles,
  ClipboardList,
} from "lucide-react";

interface RuleBuilderProps {
  config: SurgeParsedConfig;
  onChangeRules: (newRules: SurgeRule[]) => void;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  config,
  onChangeRules,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterPolicy, setFilterPolicy] = useState<string>("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // New Rule Form State
  const [newType, setNewType] = useState<RuleType>("DOMAIN-SUFFIX");
  const [newValue, setNewValue] = useState("");
  const [newPolicy, setNewPolicy] = useState("DIRECT");
  const [newNoResolve, setNewNoResolve] = useState(false);
  const [newExtended, setNewExtended] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Batch import text state
  const [batchText, setBatchText] = useState("");

  const rules = config.rules;

  // Filter rules
  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.value.toLowerCase().includes(search.toLowerCase()) ||
      r.policy.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(search.toLowerCase()));

    const matchesType = filterType === "ALL" || r.type === filterType;
    const matchesPolicy = filterPolicy === "ALL" || r.policy === filterPolicy;

    return matchesSearch && matchesType && matchesPolicy;
  });

  // Reorder Actions
  const moveRule = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === rules.length - 1)
    ) {
      return;
    }
    const updated = [...rules];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChangeRules(updated);
  };

  const deleteRule = (id: string) => {
    onChangeRules(rules.filter((r) => r.id !== id));
  };

  const toggleRuleEnabled = (id: string) => {
    onChangeRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SurgeRule = {
      id: `rule_${Date.now()}`,
      type: newType,
      value: newValue.trim(),
      policy: newPolicy,
      noResolve: newNoResolve,
      extendedMatching: newExtended,
      comment: newComment.trim() || undefined,
      rawLine: `${newType},${newValue.trim()},${newPolicy}${
        newNoResolve ? ",no-resolve" : ""
      }`,
      enabled: true,
    };

    // Insert before FINAL rule if exists
    const finalIdx = rules.findIndex((r) => r.type === "FINAL");
    let updated: SurgeRule[] = [];
    if (finalIdx !== -1) {
      updated = [
        ...rules.slice(0, finalIdx),
        created,
        ...rules.slice(finalIdx),
      ];
    } else {
      updated = [...rules, created];
    }

    onChangeRules(updated);
    setShowAddModal(false);
    setNewValue("");
    setNewComment("");
  };

  const handleBatchImport = () => {
    const lines = batchText.split(/\r?\n/);
    const newItems: SurgeRule[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const tokens = trimmed.split(",").map((s) => s.trim());
      if (tokens.length >= 2) {
        const type = tokens[0].toUpperCase() as RuleType;
        const val = tokens[1] || "";
        const policy = tokens[2] || "DIRECT";
        newItems.push({
          id: `batch_${Date.now()}_${idx}`,
          type,
          value: val,
          policy,
          noResolve: tokens.includes("no-resolve"),
          rawLine: trimmed,
          enabled: true,
        });
      }
    });

    const finalIdx = rules.findIndex((r) => r.type === "FINAL");
    let updated: SurgeRule[] = [];
    if (finalIdx !== -1) {
      updated = [
        ...rules.slice(0, finalIdx),
        ...newItems,
        ...rules.slice(finalIdx),
      ];
    } else {
      updated = [...rules, ...newItems];
    }

    onChangeRules(updated);
    setShowBatchModal(false);
    setBatchText("");
  };

  // List of all policies for selection dropdowns (deduplicated to prevent duplicate React keys)
  const availablePolicies = Array.from(
    new Set([
      "DIRECT",
      "REJECT",
      "Reject-Tiny-Gif",
      ...config.policyGroups.map((g) => g.name),
      ...config.proxies.map((p) => p.name),
    ])
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>Surge 5 Rule Matrix ({rules.length} Active Rules)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Rules are evaluated sequentially top-to-bottom. Priority matters!
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5"
            >
              <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
              <span>Batch Add Rules</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-medium shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Rule</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search domain, process, or policy..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          {/* Rule Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Rule Types</option>
            <option value="DOMAIN">DOMAIN</option>
            <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX</option>
            <option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD</option>
            <option value="PROCESS-NAME">PROCESS-NAME (macOS)</option>
            <option value="USER-AGENT">USER-AGENT</option>
            <option value="IP-CIDR">IP-CIDR</option>
            <option value="GEOIP">GEOIP</option>
            <option value="RULE-SET">RULE-SET</option>
          </select>

          {/* Policy Filter */}
          <select
            value={filterPolicy}
            onChange={(e) => setFilterPolicy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Target Policies</option>
            {availablePolicies.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">Prio</th>
                <th className="py-3 px-3 text-center w-12">On</th>
                <th className="py-3 px-4">Rule Type</th>
                <th className="py-3 px-4">Value / Matching Criteria</th>
                <th className="py-3 px-4">Target Policy Group</th>
                <th className="py-3 px-3 text-center">Flags</th>
                <th className="py-3 px-4 text-right pr-6">Reorder / Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching Surge rules found for filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => {
                  const realIndex = rules.findIndex((r) => r.id === rule.id);

                  return (
                    <tr
                      key={rule.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        !rule.enabled ? "opacity-40 italic bg-slate-950/40" : ""
                      } ${rule.type === "FINAL" ? "bg-amber-950/20 font-bold" : ""}`}
                    >
                      {/* Priority Number */}
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">
                        #{realIndex + 1}
                      </td>

                      {/* Enabled Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => toggleRuleEnabled(rule.id)}
                          className="rounded text-blue-500 focus:ring-blue-500 bg-slate-950 border-slate-700 cursor-pointer"
                        />
                      </td>

                      {/* Rule Type Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${
                            rule.type === "DOMAIN-SUFFIX"
                              ? "bg-blue-950 text-blue-400 border border-blue-800/50"
                              : rule.type === "PROCESS-NAME"
                              ? "bg-purple-950 text-purple-400 border border-purple-800/50"
                              : rule.type === "IP-CIDR"
                              ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                              : rule.type === "FINAL"
                              ? "bg-amber-950 text-amber-400 border border-amber-800/50"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {rule.type}
                        </span>
                      </td>

                      {/* Value / Criteria */}
                      <td className="py-3 px-4 text-slate-200">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">
                            {rule.type === "FINAL" ? "[Catch-All Default]" : rule.value}
                          </span>
                          {rule.comment && (
                            <span className="text-[10px] text-slate-400 italic">
                              // {rule.comment}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target Policy */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            rule.policy === "DIRECT"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                              : rule.policy === "REJECT" || rule.policy === "Reject-Tiny-Gif"
                              ? "bg-rose-950/80 text-rose-400 border border-rose-800/40"
                              : "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40"
                          }`}
                        >
                          {rule.policy}
                        </span>
                      </td>

                      {/* Flags */}
                      <td className="py-3 px-3 text-center">
                        {rule.noResolve && (
                          <span
                            className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-300 rounded border border-slate-700"
                            title="no-resolve: Does not trigger DNS lookup"
                          >
                            no-resolve
                          </span>
                        )}
                      </td>

                      {/* Priority Controls & Delete */}
                      <td className="py-3 px-4 text-right pr-6">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => moveRule(realIndex, "up")}
                            disabled={realIndex === 0}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 disabled:opacity-20"
                            title="Move Up Priority"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => moveRule(realIndex, "down")}
                            disabled={realIndex === rules.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 disabled:opacity-20"
                            title="Move Down Priority"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteRule(rule.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-2"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOM RULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add Custom Surge 5 Rule</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Rule Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as RuleType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="DOMAIN-SUFFIX">DOMAIN-SUFFIX (e.g. openai.com)</option>
                  <option value="DOMAIN">DOMAIN (Exact match)</option>
                  <option value="DOMAIN-KEYWORD">DOMAIN-KEYWORD (e.g. google)</option>
                  <option value="PROCESS-NAME">PROCESS-NAME (macOS App e.g. Slack)</option>
                  <option value="USER-AGENT">USER-AGENT (e.g. Spotify*)</option>
                  <option value="IP-CIDR">IP-CIDR (e.g. 192.168.1.0/24)</option>
                  <option value="GEOIP">GEOIP (e.g. CN, US)</option>
                  <option value="RULE-SET">RULE-SET (Remote list URL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Value / Matching String</label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. openai.com or Slack or 10.0.0.0/8"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Policy Group</label>
                <select
                  value={newPolicy}
                  onChange={(e) => setNewPolicy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                >
                  {availablePolicies.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Optional Comment</label>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="e.g. Force ChatGPT API through US Proxy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNoResolve}
                    onChange={(e) => setNewNoResolve(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500 bg-slate-950 border-slate-700"
                  />
                  <span className="text-slate-300">no-resolve (skip DNS lookup)</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH IMPORT MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-blue-400" />
                <span>Batch Import Surge Rules</span>
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-slate-400">
                Paste raw rule lines (one per line). Format: <br />
                <code className="text-blue-300">DOMAIN-SUFFIX,example.com,DIRECT</code>
              </p>

              <textarea
                rows={8}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`DOMAIN-SUFFIX,openai.com,Proxy-US\nDOMAIN-KEYWORD,google,Direct\nIP-CIDR,192.168.1.0/24,DIRECT,no-resolve`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-100 outline-none focus:border-blue-500"
              />

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchImport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md"
                >
                  Import Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
