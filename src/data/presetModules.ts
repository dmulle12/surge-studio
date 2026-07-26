import { SurgeModule } from "../types";

export const PRESET_MODULES: SurgeModule[] = [
  {
    id: "doh_enforcer",
    name: "DoH & Encrypted DNS Enforcer",
    category: "DNS",
    system: "all",
    author: "Surge Official",
    version: "2.1.0",
    description: "Forces all DNS queries through NextDNS and Cloudflare DNS-over-HTTPS with zero plaintext DNS leakage.",
    enabled: true,
    code: `#!name=Encrypted DNS Enforcer
#!desc=Enforces strict DNS-over-HTTPS (DoH) via NextDNS & Cloudflare. Prevents ISP DNS hijacking.
#!system=mac,ios

[General]
encrypted-dns-server = https://dns.nextdns.io/dns-query, https://cloudflare-dns.com/dns-query
hijack-dns = 8.8.8.8:53, 8.8.4.4:53, 1.1.1.1:53

[Host]
*.nextdns.io = server:1.1.1.1
`,
  },
  {
    id: "apple_cdn_direct",
    name: "Apple CDN & TestFlight Speedup",
    category: "Optimization",
    system: "all",
    author: "Apple Power User",
    version: "1.4.2",
    description: "Routes macOS updates, iOS app downloads, iCloud sync, and TestFlight directly through ISP for max bandwidth.",
    enabled: true,
    code: `#!name=Apple CDN Direct
#!desc=Bypasses proxies for Apple updates, Mac App Store, TestFlight, and iCloud Drive to ensure full gigabit ISP speeds.
#!system=mac,ios

[Rule]
DOMAIN-SUFFIX,apple.com,DIRECT
DOMAIN-SUFFIX,cdn-apple.com,DIRECT
DOMAIN-SUFFIX,mzstatic.com,DIRECT
DOMAIN-SUFFIX,icloud.com,DIRECT
DOMAIN-SUFFIX,icloud-content.com,DIRECT
DOMAIN-KEYWORD,testflight,DIRECT
`,
  },
  {
    id: "spotify_regional_unlock",
    name: "Spotify & Music Regional Unlocker",
    category: "Media",
    system: "all",
    author: "Audio Group",
    version: "1.0.8",
    description: "Routes Spotify authentication, streaming servers, and lyrics API through high-speed US/HK nodes.",
    enabled: true,
    code: `#!name=Spotify Regional Unlocker
#!desc=Forces Spotify audio streams and login APIs through proxy groups to bypass regional geo-blocking.
#!system=mac,ios

[Rule]
DOMAIN-SUFFIX,spotify.com,Select
DOMAIN-SUFFIX,scdn.co,Select
DOMAIN-KEYWORD,spotify,Select
USER-AGENT,Spotify*,Select
`,
  },
  {
    id: "macos_router_gateway_mod",
    name: "macOS Subnet Router & Gateway Mode",
    category: "Router",
    system: "mac",
    author: "Surge Router Team",
    version: "3.0.1",
    description: "Turns Surge on macOS into a local network router with DHCP and gateway capabilities.",
    enabled: false,
    code: `#!name=macOS Router Mode Gateway
#!desc=Configures Surge for macOS as a LAN Gateway & Network Extension Router for Apple TV, iPad, and IoT devices.
#!system=mac

[General]
tun-inclusive = true
show-primary-intra-ip = true
allow-wifi-access = true

[Rule]
IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
IP-CIDR,10.0.0.0/8,DIRECT,no-resolve
`,
  },
  {
    id: "adguard_lite_privacy",
    name: "AdGuard Lite & Tracking Filter",
    category: "Security",
    system: "all",
    author: "AdGuard Community",
    version: "5.2.0",
    description: "Blocks high-frequency mobile ad servers, analytics beacons, tracking telemetry, and malicious popups.",
    enabled: true,
    code: `#!name=AdGuard Lite Filter
#!desc=Lightweight, ultra-fast ad and tracking domain blocker for iOS & macOS.
#!system=mac,ios

[Rule]
DOMAIN-KEYWORD,adservice,Reject
DOMAIN-KEYWORD,telemetry,Reject
DOMAIN-SUFFIX,doubleclick.net,Reject
DOMAIN-SUFFIX,google-analytics.com,Reject-Tiny-Gif
DOMAIN-SUFFIX,admob.com,Reject
DOMAIN-SUFFIX,adjust.com,Reject
DOMAIN-SUFFIX,appsflyer.com,Reject
`,
  },
];
