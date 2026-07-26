export type PlatformTarget = "all" | "ios" | "macos";

export type RuleType =
  | "DOMAIN"
  | "DOMAIN-SUFFIX"
  | "DOMAIN-KEYWORD"
  | "DOMAIN-SET"
  | "IP-CIDR"
  | "IP-CIDR6"
  | "GEOIP"
  | "PROCESS-NAME"
  | "USER-AGENT"
  | "URL-REGEX"
  | "RULE-SET"
  | "AND"
  | "OR"
  | "NOT"
  | "FINAL";

export interface SurgeRule {
  id: string;
  type: RuleType;
  value: string; // e.g. "openai.com" or "192.168.1.0/24"
  policy: string; // e.g. "DIRECT", "REJECT", "Proxy-US", "Auto-Latency"
  noResolve?: boolean;
  extendedMatching?: boolean;
  comment?: string;
  rawLine: string;
  enabled: boolean;
}

export type ProxyType =
  | "direct"
  | "reject"
  | "reject-tiny-gif"
  | "http"
  | "https"
  | "socks5"
  | "shadowsocks"
  | "vmess"
  | "trojan"
  | "hysteria2"
  | "tuic"
  | "wireguard";

export interface SurgeProxy {
  id: string;
  name: string;
  type: ProxyType;
  server?: string;
  port?: number;
  parameters?: Record<string, string>;
  rawLine: string;
}

export type PolicyGroupType =
  | "select"
  | "url-test"
  | "fallback"
  | "load-balance"
  | "ssid";

export interface SurgePolicyGroup {
  id: string;
  name: string;
  type: PolicyGroupType;
  proxies: string[]; // Proxy names or sub-groups
  url?: string;
  interval?: number;
  tolerance?: number;
  evaluateBeforeUse?: boolean;
  rawLine: string;
}

export interface SurgeGeneralConfig {
  loglevel?: string;
  skipProxy?: string;
  bypassTun?: string;
  dnsServer?: string;
  encryptedDnsServer?: string;
  alwaysRealIp?: string;
  hijackDns?: string;
  tunInclusive?: string;
  tunExclusive?: string;
  httpListenPort?: string;
  socks5ListenPort?: string;
  allowWifiAccess?: boolean;
  showPrimaryIntraIp?: boolean;
  hideVpnIcon?: boolean;
  internetTestUrl?: string;
  proxyTestUrl?: string;
  geoIpUrl?: string;
  testTimeout?: string;
  ipv6?: boolean;
}

export interface SurgeHostEntry {
  id: string;
  domain: string;
  value: string; // IP or server mapping
}

export interface SurgeUrlRewriteEntry {
  id: string;
  pattern: string;
  target: string;
  type: "302" | "307" | "header" | "reject" | "tiny-gif";
}

export interface SurgeMitmConfig {
  hostname: string[];
  h2?: boolean;
  tcpConnection?: boolean;
  caP12?: string;
  caPassphrase?: string;
}

export interface SurgeScriptEntry {
  id: string;
  name: string;
  type: "http-request" | "http-response" | "cron" | "event" | "dns";
  pattern?: string;
  scriptPath: string;
  requiresBody?: boolean;
  timeout?: number;
  rawLine: string;
}

export interface SurgeParsedConfig {
  general: SurgeGeneralConfig;
  proxies: SurgeProxy[];
  policyGroups: SurgePolicyGroup[];
  rules: SurgeRule[];
  hosts: SurgeHostEntry[];
  urlRewrites: SurgeUrlRewriteEntry[];
  mitm: SurgeMitmConfig;
  scripts: SurgeScriptEntry[];
  rawText: string;
}

export interface PresetProfile {
  id: string;
  name: string;
  targetPlatform: "ios" | "macos" | "all";
  description: string;
  badge: string;
  rawConfig: string;
}

export interface TrafficTestInput {
  url: string;
  ip: string;
  processName: string;
  userAgent: string;
  sourceIp: string;
}

export interface RuleMatchStep {
  stepIndex: number;
  rule: SurgeRule;
  matched: boolean;
  reason: string;
}

export interface TraceResult {
  matchedRule: SurgeRule | null;
  policyPath: string[];
  finalNode: string;
  resolvedIp: string;
  dnsType: "Fake-IP" | "Direct-DNS" | "Host-Mapped" | "Blocked";
  simulatedLatencyMs: number;
  steps: RuleMatchStep[];
  timestamp: string;
}

export interface SurgeModule {
  id: string;
  name: string;
  description: string;
  category: "DNS" | "Security" | "Media" | "Router" | "Optimization";
  system: "mac" | "ios" | "all";
  author: string;
  version: string;
  enabled: boolean;
  code: string;
}

export interface AuditIssue {
  severity: "critical" | "warning" | "info";
  section: string;
  line?: string;
  message: string;
  suggestion: string;
}

export interface AuditResult {
  score: number;
  summary: string;
  issues: AuditIssue[];
  optimizedSnippet?: string;
}
