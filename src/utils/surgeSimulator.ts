import {
  SurgeParsedConfig,
  TrafficTestInput,
  TraceResult,
  RuleMatchStep,
  SurgeRule,
} from "../types";

export function simulateSurgeRouting(
  config: SurgeParsedConfig,
  input: TrafficTestInput
): TraceResult {
  const steps: RuleMatchStep[] = [];
  let matchedRule: SurgeRule | null = null;

  // Extract hostname & path from URL
  let hostname = "";
  let fullUrl = input.url.trim();
  try {
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = "https://" + fullUrl;
    }
    const parsed = new URL(fullUrl);
    hostname = parsed.hostname;
  } catch (_e) {
    hostname = input.url.split("/")[0].split(":")[0];
  }

  // Iterate over rules top-to-bottom
  for (let i = 0; i < config.rules.length; i++) {
    const r = config.rules[i];
    if (!r.enabled) continue;

    const { isMatch, reason } = evaluateRule(r, hostname, input);

    steps.push({
      stepIndex: i + 1,
      rule: r,
      matched: isMatch,
      reason,
    });

    if (isMatch) {
      matchedRule = r;
      break;
    }
  }

  // Fallback to FINAL rule if no previous rule matched and FINAL exists
  if (!matchedRule) {
    const finalRule = config.rules.find((r) => r.type === "FINAL" && r.enabled);
    if (finalRule) {
      matchedRule = finalRule;
      steps.push({
        stepIndex: config.rules.length + 1,
        rule: finalRule,
        matched: true,
        reason: "Fallback to [FINAL] catch-all rule",
      });
    } else {
      matchedRule = {
        id: "implicit_final",
        type: "FINAL",
        value: "",
        policy: "DIRECT",
        rawLine: "FINAL,DIRECT (Implicit)",
        enabled: true,
      };
      steps.push({
        stepIndex: config.rules.length + 1,
        rule: matchedRule,
        matched: true,
        reason: "Implicit default catch-all rule",
      });
    }
  }

  // Resolve policy path
  const targetPolicy = matchedRule.policy;
  const policyPath: string[] = [targetPolicy];
  let finalNode = targetPolicy;
  let simulatedLatencyMs = 0;

  // Check if targetPolicy is a policy group
  const group = config.policyGroups.find((g) => g.name === targetPolicy);
  if (group) {
    if (group.type === "select") {
      const selected = group.proxies[0] || "DIRECT";
      policyPath.push(`Select [${group.name}]`);
      policyPath.push(selected);
      finalNode = selected;
      simulatedLatencyMs = selected === "DIRECT" ? 12 : 85;
    } else if (group.type === "url-test" || group.type === "fallback") {
      const activeNode = group.proxies[0] || "DIRECT";
      policyPath.push(`${group.type.toUpperCase()} [${group.name}]`);
      policyPath.push(`${activeNode} (Best Latency)`);
      finalNode = activeNode;
      simulatedLatencyMs = 45;
    } else if (group.type === "load-balance") {
      const node = group.proxies[0] || "DIRECT";
      policyPath.push(`Load-Balance [${group.name}]`);
      policyPath.push(node);
      finalNode = node;
      simulatedLatencyMs = 62;
    }
  } else {
    if (targetPolicy === "DIRECT") {
      simulatedLatencyMs = 8;
    } else if (targetPolicy === "REJECT" || targetPolicy === "Reject-Tiny-Gif") {
      simulatedLatencyMs = 0;
    } else {
      simulatedLatencyMs = 120;
    }
  }

  // Determine Fake-IP vs Direct-DNS vs Host
  let dnsType: "Fake-IP" | "Direct-DNS" | "Host-Mapped" | "Blocked" = "Direct-DNS";
  let resolvedIp = input.ip || "104.244.42.1";

  if (targetPolicy === "REJECT" || targetPolicy === "Reject-Tiny-Gif") {
    dnsType = "Blocked";
    resolvedIp = "0.0.0.0";
  } else {
    // Check hosts entry
    const hostEntry = config.hosts.find(
      (h) => h.domain.toLowerCase() === hostname.toLowerCase()
    );
    if (hostEntry) {
      dnsType = "Host-Mapped";
      resolvedIp = hostEntry.value;
    } else if (
      config.general.alwaysRealIp &&
      config.general.alwaysRealIp.includes(hostname)
    ) {
      dnsType = "Direct-DNS";
      resolvedIp = "203.0.113.88";
    } else {
      dnsType = "Fake-IP";
      // Generate deterministic synthetic Fake-IP e.g. 198.18.x.x
      const hash = simpleHash(hostname);
      resolvedIp = `198.18.${(hash % 250) + 1}.${(hash % 254) + 1}`;
    }
  }

  return {
    matchedRule,
    policyPath,
    finalNode,
    resolvedIp,
    dnsType,
    simulatedLatencyMs,
    steps,
    timestamp: new Date().toLocaleTimeString(),
  };
}

function evaluateRule(
  r: SurgeRule,
  hostname: string,
  input: TrafficTestInput
): { isMatch: boolean; reason: string } {
  const targetHost = hostname.toLowerCase();
  const val = (r.value || "").toLowerCase();

  switch (r.type) {
    case "DOMAIN":
      if (targetHost === val) {
        return { isMatch: true, reason: `Exact domain match: ${r.value}` };
      }
      return { isMatch: false, reason: `Domain ${targetHost} != ${val}` };

    case "DOMAIN-SUFFIX":
      if (targetHost === val || targetHost.endsWith("." + val)) {
        return { isMatch: true, reason: `Domain suffix matched .${val}` };
      }
      return { isMatch: false, reason: `Domain ${targetHost} does not end with .${val}` };

    case "DOMAIN-KEYWORD":
      if (targetHost.includes(val)) {
        return { isMatch: true, reason: `Domain keyword match: contains "${val}"` };
      }
      return { isMatch: false, reason: `Domain ${targetHost} does not contain "${val}"` };

    case "PROCESS-NAME":
      if (
        input.processName &&
        input.processName.toLowerCase().includes(val)
      ) {
        return { isMatch: true, reason: `Process name match: ${input.processName} contains "${r.value}"` };
      }
      return { isMatch: false, reason: `Process ${input.processName || "N/A"} != ${r.value}` };

    case "USER-AGENT":
      if (input.userAgent && isUserAgentMatch(input.userAgent, r.value)) {
        return { isMatch: true, reason: `User-Agent match: ${r.value}` };
      }
      return { isMatch: false, reason: `User-Agent did not match pattern ${r.value}` };

    case "IP-CIDR":
    case "IP-CIDR6":
      if (input.ip && isIpInCidr(input.ip, r.value)) {
        return { isMatch: true, reason: `IP ${input.ip} falls inside CIDR ${r.value}` };
      }
      return { isMatch: false, reason: `IP ${input.ip || "N/A"} outside CIDR ${r.value}` };

    case "GEOIP":
      if (val === "cn" && (targetHost.endsWith(".cn") || input.ip.startsWith("114.") || input.ip.startsWith("220."))) {
        return { isMatch: true, reason: `GEOIP matched country code ${r.value.toUpperCase()}` };
      }
      return { isMatch: false, reason: `GEOIP did not match ${r.value.toUpperCase()}` };

    case "URL-REGEX":
      try {
        const re = new RegExp(r.value, "i");
        if (re.test(input.url)) {
          return { isMatch: true, reason: `URL matched regex: ${r.value}` };
        }
      } catch (_e) {
        if (input.url.includes(r.value)) {
          return { isMatch: true, reason: `URL matched string: ${r.value}` };
        }
      }
      return { isMatch: false, reason: `URL regex mismatch: ${r.value}` };

    case "RULE-SET":
      if (targetHost.includes(val.replace("https://", "").split("/")[0]) || targetHost.includes("ad") || targetHost.includes("google")) {
        return { isMatch: true, reason: `Match within RULE-SET list: ${r.value}` };
      }
      return { isMatch: false, reason: `Not matched in RULE-SET ${r.value}` };

    case "FINAL":
      return { isMatch: true, reason: "Default [FINAL] rule catch-all" };

    default:
      return { isMatch: false, reason: `Unhandled rule type ${r.type}` };
  }
}

function isUserAgentMatch(ua: string, pattern: string): boolean {
  const cleanUa = ua.toLowerCase();
  const cleanPat = pattern.toLowerCase().replace("*", "");
  return cleanUa.includes(cleanPat);
}

function isIpInCidr(ip: string, cidr: string): boolean {
  if (cidr.startsWith("192.168.") && ip.startsWith("192.168.")) return true;
  if (cidr.startsWith("10.") && ip.startsWith("10.")) return true;
  if (cidr.startsWith("172.16.") && ip.startsWith("172.16.")) return true;
  if (cidr.startsWith("127.") && ip.startsWith("127.")) return true;
  return false;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
