import {
  SurgeParsedConfig,
  SurgeGeneralConfig,
  SurgeProxy,
  SurgePolicyGroup,
  SurgeRule,
  SurgeHostEntry,
  SurgeUrlRewriteEntry,
  SurgeMitmConfig,
  SurgeScriptEntry,
  RuleType,
  ProxyType,
  PolicyGroupType,
} from "../types";

export function parseSurgeConfig(rawConfigText: string): SurgeParsedConfig {
  const lines = rawConfigText.split(/\r?\n/);

  const general: SurgeGeneralConfig = {};
  const proxies: SurgeProxy[] = [];
  const policyGroups: SurgePolicyGroup[] = [];
  const rules: SurgeRule[] = [];
  const hosts: SurgeHostEntry[] = [];
  const urlRewrites: SurgeUrlRewriteEntry[] = [];
  const mitm: SurgeMitmConfig = { hostname: [] };
  const scripts: SurgeScriptEntry[] = [];

  let currentSection = "";

  lines.forEach((lineRaw, idx) => {
    const line = lineRaw.trim();
    if (!line) return;

    // Detect Section Header e.g. [General], [Rule], etc.
    const sectionMatch = line.match(/^\[(.*?)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      return;
    }

    // Ignore full-line comments in non-rule parsing or preserve if needed
    if (line.startsWith("#") || line.startsWith(";")) {
      return;
    }

    switch (currentSection.toLowerCase()) {
      case "general":
        parseGeneralLine(line, general);
        break;
      case "proxy":
        parseProxyLine(line, proxies, idx);
        break;
      case "proxy group":
      case "proxy-group":
        parsePolicyGroupLine(line, policyGroups, idx);
        break;
      case "rule":
        parseRuleLine(line, rules, idx);
        break;
      case "host":
        parseHostLine(line, hosts, idx);
        break;
      case "url rewrite":
      case "url-rewrite":
        parseUrlRewriteLine(line, urlRewrites, idx);
        break;
      case "mitm":
        parseMitmLine(line, mitm);
        break;
      case "script":
        parseScriptLine(line, scripts, idx);
        break;
      default:
        break;
    }
  });

  return {
    general,
    proxies,
    policyGroups,
    rules,
    hosts,
    urlRewrites,
    mitm,
    scripts,
    rawText: rawConfigText,
  };
}

function parseGeneralLine(line: string, general: SurgeGeneralConfig) {
  const parts = line.split("=");
  if (parts.length < 2) return;
  const key = parts[0].trim();
  const val = parts.slice(1).join("=").trim();

  switch (key) {
    case "loglevel":
      general.loglevel = val;
      break;
    case "skip-proxy":
      general.skipProxy = val;
      break;
    case "bypass-tun":
      general.bypassTun = val;
      break;
    case "dns-server":
      general.dnsServer = val;
      break;
    case "encrypted-dns-server":
      general.encryptedDnsServer = val;
      break;
    case "always-real-ip":
      general.alwaysRealIp = val;
      break;
    case "hijack-dns":
      general.hijackDns = val;
      break;
    case "tun-inclusive":
      general.tunInclusive = val;
      break;
    case "tun-exclusive":
      general.tunExclusive = val;
      break;
    case "http-listen-port":
      general.httpListenPort = val;
      break;
    case "socks5-listen-port":
      general.socks5ListenPort = val;
      break;
    case "allow-wifi-access":
      general.allowWifiAccess = val.toLowerCase() === "true";
      break;
    case "show-primary-intra-ip":
      general.showPrimaryIntraIp = val.toLowerCase() === "true";
      break;
    case "hide-vpn-icon":
      general.hideVpnIcon = val.toLowerCase() === "true";
      break;
    case "internet-test-url":
      general.internetTestUrl = val;
      break;
    case "proxy-test-url":
      general.proxyTestUrl = val;
      break;
    case "geoip-maxmind-url":
    case "geo-ip-url":
      general.geoIpUrl = val;
      break;
    case "test-timeout":
      general.testTimeout = val;
      break;
    case "ipv6":
      general.ipv6 = val.toLowerCase() === "true";
      break;
  }
}

function parseProxyLine(line: string, proxies: SurgeProxy[], idx: number) {
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) return;

  const name = line.substring(0, eqIdx).trim();
  const rest = line.substring(eqIdx + 1).trim();
  const tokens = rest.split(",").map((s) => s.trim());

  if (tokens.length === 0) return;

  const typeStr = tokens[0].toLowerCase() as ProxyType;
  let server = tokens[1] || "";
  let port = parseInt(tokens[2], 10) || undefined;

  const parameters: Record<string, string> = {};
  for (let i = 3; i < tokens.length; i++) {
    const [pKey, pVal] = tokens[i].split("=").map((s) => s.trim());
    if (pKey && pVal) {
      parameters[pKey] = pVal;
    }
  }

  proxies.push({
    id: `proxy_${idx}_${name}`,
    name,
    type: typeStr,
    server,
    port,
    parameters,
    rawLine: line,
  });
}

function parsePolicyGroupLine(
  line: string,
  groups: SurgePolicyGroup[],
  idx: number
) {
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) return;

  const name = line.substring(0, eqIdx).trim();
  const rest = line.substring(eqIdx + 1).trim();
  const tokens = rest.split(",").map((s) => s.trim());

  if (tokens.length === 0) return;

  const groupType = tokens[0].toLowerCase() as PolicyGroupType;
  const proxyList: string[] = [];
  let url: string | undefined;
  let interval: number | undefined;
  let tolerance: number | undefined;
  let evaluateBeforeUse: boolean | undefined;

  for (let i = 1; i < tokens.length; i++) {
    const item = tokens[i];
    if (item.includes("=")) {
      const [k, v] = item.split("=").map((s) => s.trim());
      if (k === "url") url = v;
      else if (k === "interval") interval = parseInt(v, 10);
      else if (k === "tolerance") tolerance = parseInt(v, 10);
      else if (k === "evaluate-before-use")
        evaluateBeforeUse = v.toLowerCase() === "true";
    } else {
      proxyList.push(item);
    }
  }

  groups.push({
    id: `group_${idx}_${name}`,
    name,
    type: groupType,
    proxies: proxyList,
    url,
    interval,
    tolerance,
    evaluateBeforeUse,
    rawLine: line,
  });
}

function parseRuleLine(line: string, rules: SurgeRule[], idx: number) {
  const commentIdx = line.indexOf("//");
  let comment: string | undefined;
  let cleanLine = line;

  if (commentIdx !== -1) {
    comment = line.substring(commentIdx + 2).trim();
    cleanLine = line.substring(0, commentIdx).trim();
  }

  const tokens = cleanLine.split(",").map((s) => s.trim());
  if (tokens.length === 0) return;

  const ruleType = tokens[0].toUpperCase() as RuleType;

  if (ruleType === "FINAL") {
    rules.push({
      id: `rule_${idx}`,
      type: "FINAL",
      value: "",
      policy: tokens[1] || "DIRECT",
      noResolve: tokens.includes("dns-failed"),
      comment,
      rawLine: line,
      enabled: !line.startsWith("//"),
    });
    return;
  }

  const value = tokens[1] || "";
  const policy = tokens[2] || "DIRECT";
  const noResolve = tokens.includes("no-resolve");
  const extendedMatching = tokens.includes("extended-matching");

  rules.push({
    id: `rule_${idx}`,
    type: ruleType,
    value,
    policy,
    noResolve,
    extendedMatching,
    comment,
    rawLine: line,
    enabled: true,
  });
}

function parseHostLine(line: string, hosts: SurgeHostEntry[], idx: number) {
  const parts = line.split("=").map((s) => s.trim());
  if (parts.length < 2) return;
  hosts.push({
    id: `host_${idx}`,
    domain: parts[0],
    value: parts[1],
  });
}

function parseUrlRewriteLine(
  line: string,
  rewrites: SurgeUrlRewriteEntry[],
  idx: number
) {
  const tokens = line.split(/\s+/).map((s) => s.trim());
  if (tokens.length < 2) return;

  const pattern = tokens[0];
  const target = tokens[1] || "";
  const typeStr = (tokens[2] || "header").toLowerCase() as any;

  rewrites.push({
    id: `rewrite_${idx}`,
    pattern,
    target,
    type: typeStr,
  });
}

function parseMitmLine(line: string, mitm: SurgeMitmConfig) {
  const parts = line.split("=").map((s) => s.trim());
  if (parts.length < 2) return;

  const key = parts[0];
  const val = parts.slice(1).join("=");

  if (key === "hostname") {
    const list = val.split(",").map((s) => s.trim());
    mitm.hostname = list;
  } else if (key === "h2") {
    mitm.h2 = val.toLowerCase() === "true";
  } else if (key === "tcp-connection") {
    mitm.tcpConnection = val.toLowerCase() === "true";
  }
}

function parseScriptLine(
  line: string,
  scripts: SurgeScriptEntry[],
  idx: number
) {
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) return;

  const name = line.substring(0, eqIdx).trim();
  const rest = line.substring(eqIdx + 1).trim();
  const tokens = rest.split(",").map((s) => s.trim());

  let type: any = "http-request";
  let pattern: string | undefined;
  let scriptPath = "";
  let requiresBody: boolean | undefined;

  tokens.forEach((tok) => {
    if (tok.startsWith("type=")) type = tok.replace("type=", "");
    else if (tok.startsWith("pattern=")) pattern = tok.replace("pattern=", "");
    else if (tok.startsWith("script-path="))
      scriptPath = tok.replace("script-path=", "");
    else if (tok.startsWith("requires-body="))
      requiresBody = tok.replace("requires-body=", "").toLowerCase() === "true";
  });

  scripts.push({
    id: `script_${idx}`,
    name,
    type,
    pattern,
    scriptPath,
    requiresBody,
    rawLine: line,
  });
}

export function serializeSurgeConfig(config: SurgeParsedConfig): string {
  const out: string[] = [];

  // [General]
  out.push("[General]");
  if (config.general.loglevel) out.push(`loglevel = ${config.general.loglevel}`);
  if (config.general.skipProxy)
    out.push(`skip-proxy = ${config.general.skipProxy}`);
  if (config.general.bypassTun)
    out.push(`bypass-tun = ${config.general.bypassTun}`);
  if (config.general.dnsServer)
    out.push(`dns-server = ${config.general.dnsServer}`);
  if (config.general.encryptedDnsServer)
    out.push(`encrypted-dns-server = ${config.general.encryptedDnsServer}`);
  if (config.general.alwaysRealIp)
    out.push(`always-real-ip = ${config.general.alwaysRealIp}`);
  if (config.general.hijackDns)
    out.push(`hijack-dns = ${config.general.hijackDns}`);
  if (config.general.tunInclusive)
    out.push(`tun-inclusive = ${config.general.tunInclusive}`);
  if (config.general.tunExclusive)
    out.push(`tun-exclusive = ${config.general.tunExclusive}`);
  if (config.general.httpListenPort)
    out.push(`http-listen-port = ${config.general.httpListenPort}`);
  if (config.general.socks5ListenPort)
    out.push(`socks5-listen-port = ${config.general.socks5ListenPort}`);
  if (config.general.allowWifiAccess !== undefined)
    out.push(`allow-wifi-access = ${config.general.allowWifiAccess}`);
  if (config.general.showPrimaryIntraIp !== undefined)
    out.push(`show-primary-intra-ip = ${config.general.showPrimaryIntraIp}`);
  if (config.general.hideVpnIcon !== undefined)
    out.push(`hide-vpn-icon = ${config.general.hideVpnIcon}`);
  if (config.general.internetTestUrl)
    out.push(`internet-test-url = ${config.general.internetTestUrl}`);
  if (config.general.proxyTestUrl)
    out.push(`proxy-test-url = ${config.general.proxyTestUrl}`);
  if (config.general.geoIpUrl) out.push(`geo-ip-url = ${config.general.geoIpUrl}`);
  if (config.general.ipv6 !== undefined)
    out.push(`ipv6 = ${config.general.ipv6}`);
  out.push("");

  // [Proxy]
  out.push("[Proxy]");
  config.proxies.forEach((p) => {
    if (p.type === "direct") {
      out.push(`${p.name} = direct`);
    } else if (p.type === "reject") {
      out.push(`${p.name} = reject`);
    } else {
      let line = `${p.name} = ${p.type}, ${p.server}, ${p.port}`;
      if (p.parameters) {
        Object.entries(p.parameters).forEach(([k, v]) => {
          line += `, ${k}=${v}`;
        });
      }
      out.push(line);
    }
  });
  out.push("");

  // [Proxy Group]
  out.push("[Proxy Group]");
  config.policyGroups.forEach((g) => {
    let line = `${g.name} = ${g.type}, ${g.proxies.join(", ")}`;
    if (g.url) line += `, url=${g.url}`;
    if (g.interval) line += `, interval=${g.interval}`;
    if (g.tolerance) line += `, tolerance=${g.tolerance}`;
    if (g.evaluateBeforeUse) line += `, evaluate-before-use=true`;
    out.push(line);
  });
  out.push("");

  // [Rule]
  out.push("[Rule]");
  config.rules.forEach((r) => {
    if (!r.enabled) {
      out.push(`// ${r.rawLine}`);
      return;
    }
    if (r.type === "FINAL") {
      let line = `FINAL,${r.policy}`;
      if (r.noResolve) line += `,dns-failed`;
      if (r.comment) line += ` // ${r.comment}`;
      out.push(line);
    } else {
      let line = `${r.type},${r.value},${r.policy}`;
      if (r.noResolve) line += `,no-resolve`;
      if (r.extendedMatching) line += `,extended-matching`;
      if (r.comment) line += ` // ${r.comment}`;
      out.push(line);
    }
  });
  out.push("");

  // [Host]
  if (config.hosts.length > 0) {
    out.push("[Host]");
    config.hosts.forEach((h) => {
      out.push(`${h.domain} = ${h.value}`);
    });
    out.push("");
  }

  // [URL Rewrite]
  if (config.urlRewrites.length > 0) {
    out.push("[URL Rewrite]");
    config.urlRewrites.forEach((u) => {
      out.push(`${u.pattern} ${u.target} ${u.type}`);
    });
    out.push("");
  }

  // [MITM]
  if (config.mitm.hostname.length > 0) {
    out.push("[MITM]");
    out.push(`hostname = ${config.mitm.hostname.join(", ")}`);
    if (config.mitm.h2 !== undefined) out.push(`h2 = ${config.mitm.h2}`);
    if (config.mitm.tcpConnection !== undefined)
      out.push(`tcp-connection = ${config.mitm.tcpConnection}`);
    out.push("");
  }

  // [Script]
  if (config.scripts.length > 0) {
    out.push("[Script]");
    config.scripts.forEach((s) => {
      let line = `${s.name} = type=${s.type}`;
      if (s.pattern) line += `,pattern=${s.pattern}`;
      line += `,script-path=${s.scriptPath}`;
      if (s.requiresBody) line += `,requires-body=true`;
      out.push(line);
    });
    out.push("");
  }

  return out.join("\n");
}
