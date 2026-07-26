import { PresetProfile } from "../types";

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: "ios_mobile_flagship",
    name: "Surge 5 iOS Mobile Flagship (iOS 手机全功能优化配置)",
    targetPlatform: "ios",
    badge: "Surge iOS 专属",
    description: "专为 iOS iPhone & iPad 优化的 Surge 5 配置。无 macOS 进程冗余，支持 Fake-IP、DoH 加密 DNS、蜂窝网络节能、AI 与音视频分流。",
    rawConfig: `[General]
loglevel = notify
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, captive.apple.com
bypass-tun = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12
dns-server = 223.5.5.5, 119.29.29.29, 1.1.1.1
encrypted-dns-server = https://dns.alidns.com/dns-query, https://cloudflare-dns.com/dns-query
always-real-ip = *.srv.nintendo.net, *.stun.playstation.net, msftconnecttest.com, xbox.*.microsoft.com
hijack-dns = 8.8.8.8:53, 8.8.4.4:53
http-listen-port = 6152
socks5-listen-port = 6153
allow-wifi-access = false
show-primary-intra-ip = true
hide-vpn-icon = false
internet-test-url = http://www.apple.com/library/test/success.html
proxy-test-url = http://cp.cloudflare.com/generate_204
geo-ip-url = https://raw.githubusercontent.com/Hackl0us/GeoLite2-Country/main/GeoLite2-Country.mmdb
ipv6 = false

[Proxy]
Direct = direct
Reject = reject
Reject-Tiny-Gif = reject-tiny-gif
US-Node-01 = hysteria2, us1.surge-proxy.net, 8443, password=secret_token_123, download-bandwidth=100
HK-Node-01 = vmess, hk1.surge-proxy.net, 443, username=a1b2c3d4-e5f6-7890, ws=true, ws-path=/vmess
SG-Node-01 = shadowsocks, sg1.surge-proxy.net, 8388, encrypt-method=chacha20-ietf-poly1305, password=ss_key_pass

[Proxy Group]
Select = select, Auto-Latency, HK-Node-01, US-Node-01, SG-Node-01, Direct
AI-Services = select, US-Node-01, SG-Node-01, HK-Node-01
Streaming = select, HK-Node-01, SG-Node-01, US-Node-01
Auto-Latency = url-test, US-Node-01, HK-Node-01, SG-Node-01, url=http://cp.cloudflare.com/generate_204, interval=300, tolerance=50

[Rule]
# AI & Productivity (iPhone / iPad Apps & Web)
DOMAIN-SUFFIX,openai.com,AI-Services
DOMAIN-SUFFIX,chatgpt.com,AI-Services
DOMAIN-SUFFIX,anthropic.com,AI-Services
DOMAIN-SUFFIX,claude.ai,AI-Services

# Streaming Media
DOMAIN-SUFFIX,netflix.com,Streaming
DOMAIN-SUFFIX,nflxso.net,Streaming
DOMAIN-SUFFIX,youtube.com,Streaming
DOMAIN-SUFFIX,googlevideo.com,Streaming
DOMAIN-SUFFIX,spotify.com,Streaming

# Domestic CN Services & Direct Bypass
DOMAIN-SUFFIX,cn,DIRECT
DOMAIN-SUFFIX,alibaba.com,DIRECT
DOMAIN-SUFFIX,taobao.com,DIRECT
DOMAIN-SUFFIX,baidu.com,DIRECT
DOMAIN-SUFFIX,qq.com,DIRECT
GEOIP,CN,DIRECT,no-resolve

# Ad & Telemetry Blocking
DOMAIN-KEYWORD,adservice,Reject
DOMAIN-SUFFIX,doubleclick.net,Reject
DOMAIN-SUFFIX,google-analytics.com,Reject-Tiny-Gif

# LAN & Final Catch-All
IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
IP-CIDR,10.0.0.0/8,DIRECT,no-resolve
FINAL,Select,dns-failed

[Host]
*.google.com = server:8.8.8.8

[URL Rewrite]
^http://www.google.cn http://www.google.com 302
^https?://.*\\.doubleclick\\.net reject

[MITM]
hostname = *.openai.com, *.claude.ai
h2 = true
tcp-connection = true
`,
  },
  {
    id: "universal_power",
    name: "Surge 5 Universal Power Profile",
    targetPlatform: "all",
    badge: "Recommended",
    description: "High-performance configuration with Fake-IP, DoH/Encrypted DNS, Auto-Latency testing, AI & Streaming policy groups.",
    rawConfig: `[General]
loglevel = notify
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, captive.apple.com
bypass-tun = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12
dns-server = 223.5.5.5, 119.29.29.29, 1.1.1.1
encrypted-dns-server = https://dns.nextdns.io/dns-query, https://cloudflare-dns.com/dns-query
always-real-ip = *.srv.nintendo.net, *.stun.playstation.net, msftconnecttest.com, xbox.*.microsoft.com
hijack-dns = 8.8.8.8:53, 8.8.4.4:53
http-listen-port = 6152
socks5-listen-port = 6153
allow-wifi-access = true
show-primary-intra-ip = true
hide-vpn-icon = false
internet-test-url = http://www.apple.com/library/test/success.html
proxy-test-url = http://cp.cloudflare.com/generate_204
geo-ip-url = https://raw.githubusercontent.com/Hackl0us/GeoLite2-Country/main/GeoLite2-Country.mmdb
ipv6 = false

[Proxy]
Direct = direct
Reject = reject
Reject-Tiny-Gif = reject-tiny-gif
US-Node-01 = hysteria2, us1.surge-proxy.net, 8443, password=secret_token_123, download-bandwidth=100
US-Node-02 = trojan, us2.surge-proxy.net, 443, password=trojan_pass_99
HK-Node-01 = vmess, hk1.surge-proxy.net, 443, username=a1b2c3d4-e5f6-7890, ws=true, ws-path=/vmess
SG-Node-01 = shadowsocks, sg1.surge-proxy.net, 8388, encrypt-method=chacha20-ietf-poly1305, password=ss_key_pass

[Proxy Group]
Select = select, Auto-Latency, US-Node-01, HK-Node-01, SG-Node-01, Direct
AI-Services = select, US-Node-01, US-Node-02, SG-Node-01
Streaming = select, HK-Node-01, SG-Node-01, US-Node-01
Auto-Latency = url-test, US-Node-01, US-Node-02, HK-Node-01, SG-Node-01, url=http://cp.cloudflare.com/generate_204, interval=300, tolerance=50
Fallback-Group = fallback, US-Node-01, HK-Node-01, SG-Node-01, url=http://www.gstatic.com/generate_204, interval=180

[Rule]
# AI & Developer Tools
DOMAIN-SUFFIX,openai.com,AI-Services
DOMAIN-SUFFIX,chatgpt.com,AI-Services
DOMAIN-SUFFIX,anthropic.com,AI-Services
DOMAIN-SUFFIX,claude.ai,AI-Services
DOMAIN-KEYWORD,github,Select

# Streaming Media
DOMAIN-SUFFIX,netflix.com,Streaming
DOMAIN-SUFFIX,nflxso.net,Streaming
DOMAIN-SUFFIX,youtube.com,Streaming
DOMAIN-SUFFIX,googlevideo.com,Streaming
DOMAIN-SUFFIX,spotify.com,Streaming

# Domestic & Direct Bypass
DOMAIN-SUFFIX,cn,DIRECT
DOMAIN-SUFFIX,alibaba.com,DIRECT
DOMAIN-SUFFIX,taobao.com,DIRECT
DOMAIN-SUFFIX,baidu.com,DIRECT
GEOIP,CN,DIRECT,no-resolve

# Ad & Telemetry Blocking
DOMAIN-KEYWORD,adservice,Reject
DOMAIN-SUFFIX,doubleclick.net,Reject
DOMAIN-SUFFIX,google-analytics.com,Reject-Tiny-Gif

# macOS Specific Process Routing
PROCESS-NAME,Slack,Select
PROCESS-NAME,Telegram,Auto-Latency
PROCESS-NAME,Xcode,DIRECT

# LAN & Final Catch-All
IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
IP-CIDR,10.0.0.0/8,DIRECT,no-resolve
FINAL,Select,dns-failed

[Host]
*.google.com = server:8.8.8.8
api.internal.local = 192.168.1.100

[URL Rewrite]
^http://www.google.cn http://www.google.com 302
^https?://.*\.doubleclick\.net reject

[MITM]
hostname = *.openai.com, *.claude.ai, %APPEND% *.github.com
h2 = true
tcp-connection = true
`,
  },
  {
    id: "macos_router_gateway",
    name: "macOS Gateway & Router Mode Profile",
    targetPlatform: "macos",
    badge: "macOS Router",
    description: "Transforms Surge for macOS into a high-throughput router & DNS gateway for all local network devices.",
    rawConfig: `[General]
loglevel = notify
tun-inclusive = true
tun-exclusive = false
show-primary-intra-ip = true
allow-wifi-access = true
http-listen-port = 6152
socks5-listen-port = 6153
dns-server = 1.1.1.1, 8.8.8.8
encrypted-dns-server = https://dns.quad9.net/dns-query
always-real-ip = *.apple.com, *.icloud.com
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8
internet-test-url = http://www.apple.com

[Proxy]
Direct = direct
Reject = reject
Router-Proxy-HK = hysteria2, router-hk.proxy-server.net, 8443, password=router_secret
Router-Proxy-US = trojan, router-us.proxy-server.net, 443, password=router_trojan

[Proxy Group]
Router-Main = select, Auto-Test-Router, Router-Proxy-HK, Router-Proxy-US, Direct
Auto-Test-Router = url-test, Router-Proxy-HK, Router-Proxy-US, url=http://cp.cloudflare.com/generate_204, interval=120, tolerance=30

[Rule]
PROCESS-NAME,Docker,Router-Main
PROCESS-NAME,Termius,Router-Main
PROCESS-NAME,Slack,Router-Main
DOMAIN-SUFFIX,apple.com,DIRECT
DOMAIN-SUFFIX,cn,DIRECT
GEOIP,CN,DIRECT,no-resolve
FINAL,Router-Main,dns-failed

[Host]
router.surge.local = 192.168.1.1
`,
  },
  {
    id: "strict_privacy_adblock",
    name: "Strict Privacy & Anti-Tracking Shield",
    targetPlatform: "all",
    badge: "Privacy Focus",
    description: "Maximum tracking block, encrypted DNS enforcement, URL parameter strippers, and canvas fingerprint protections.",
    rawConfig: `[General]
loglevel = warning
dns-server = 1.1.1.1, 9.9.9.9
encrypted-dns-server = https://dns.nextdns.io/dns-query
hijack-dns = 8.8.8.8:53, 8.8.4.4:53
always-real-ip = captive.apple.com
skip-proxy = 127.0.0.1, localhost
http-listen-port = 6152

[Proxy]
Direct = direct
Reject = reject
Reject-Tiny-Gif = reject-tiny-gif
Privacy-Node = tuic, privacy-node.org, 8443, uuid=e5f6-7890-a1b2, password=tuic_secure_pass

[Proxy Group]
Shield-Group = select, Privacy-Node, Direct

[Rule]
# Anti-Tracking Rules
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Advertising/Advertising.list,Reject
DOMAIN-KEYWORD,telemetry,Reject
DOMAIN-KEYWORD,analytics,Reject
DOMAIN-KEYWORD,tracker,Reject
DOMAIN-SUFFIX,doubleclick.net,Reject
DOMAIN-SUFFIX,scorecardresearch.com,Reject-Tiny-Gif

# Crypto & Web3 Protection
DOMAIN-KEYWORD,phishing,Reject

FINAL,Shield-Group,dns-failed

[URL Rewrite]
^https?://.*[\?&]utm_source=.* reject-tiny-gif
^https?://.*[\?&]fbclid=.* reject-tiny-gif
`,
  },
  {
    id: "developer_scripting",
    name: "Developer Scripting & Debug Sandbox",
    targetPlatform: "all",
    badge: "Scripting",
    description: "Includes live Surge JS script bindings ($request & $response modification), local hosts, and debug inspection.",
    rawConfig: `[General]
loglevel = verbose
http-listen-port = 6152
socks5-listen-port = 6153
allow-wifi-access = true

[Proxy]
Direct = direct
Reject = reject
Dev-Proxy = http, 127.0.0.1, 8080

[Proxy Group]
Dev-Select = select, Dev-Proxy, Direct

[Rule]
DOMAIN-SUFFIX,httpbin.org,Dev-Select
FINAL,Dev-Select

[Host]
local.test = 127.0.0.1
api.mock.dev = 127.0.0.1

[Script]
HeaderInspector = type=http-request,pattern=^https?://httpbin\.org/headers,script-path=https://raw.githubusercontent.com/SurgeScript/examples/main/header_inspector.js,requires-body=true
ResponseInject = type=http-response,pattern=^https?://httpbin\.org/json,script-path=https://raw.githubusercontent.com/SurgeScript/examples/main/response_inject.js,requires-body=true

[MITM]
hostname = httpbin.org, *.httpbin.org
h2 = true
`,
  },
  {
    id: "back_to_china",
    name: "Surge 5 Back To China (海外回国加速模式)",
    targetPlatform: "all",
    badge: "回国模式",
    description: "Tailored for overseas users to unlock Mainland China streaming (Bilibili, iQiyi, Tencent, NetEase Music, Taobao) via CN proxies while keeping local overseas traffic Direct.",
    rawConfig: `[General]
loglevel = notify
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, localhost, *.local, captive.apple.com
bypass-tun = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12
dns-server = 223.5.5.5, 119.29.29.29, 1.1.1.1
encrypted-dns-server = https://dns.alidns.com/dns-query, https://doh.pub/dns-query
always-real-ip = *.srv.nintendo.net, *.stun.playstation.net, msftconnecttest.com, xbox.*.microsoft.com
hijack-dns = 8.8.8.8:53, 8.8.4.4:53
http-listen-port = 6152
socks5-listen-port = 6153
allow-wifi-access = true
show-primary-intra-ip = true
hide-vpn-icon = false
internet-test-url = http://www.baidu.com
proxy-test-url = http://connect.rom.miui.com/generate_204
geo-ip-url = https://raw.githubusercontent.com/Hackl0us/GeoLite2-Country/main/GeoLite2-Country.mmdb
ipv6 = false

[Proxy]
Direct = direct
Reject = reject
Reject-Tiny-Gif = reject-tiny-gif
CN-Shanghai-01 = hysteria2, sh1.cn-proxy.net, 8443, password=cn_pass_123, download-bandwidth=200
CN-Beijing-02 = trojan, bj2.cn-proxy.net, 443, password=cn_pass_456
CN-Guangzhou-03 = vmess, gz3.cn-proxy.net, 443, username=cn-user-789, ws=true, ws-path=/vmess

[Proxy Group]
BackToCN = select, CN-Auto-Latency, CN-Shanghai-01, CN-Beijing-02, CN-Guangzhou-03, Direct
CN-Media = select, CN-Shanghai-01, CN-Guangzhou-03, CN-Beijing-02
CN-Auto-Latency = url-test, CN-Shanghai-01, CN-Beijing-02, CN-Guangzhou-03, url=http://connect.rom.miui.com/generate_204, interval=300, tolerance=50
Global-Direct = select, Direct, BackToCN

[Rule]
# CN Streaming & Music Unlocking (国内音视频解锁)
DOMAIN-SUFFIX,bilibili.com,CN-Media
DOMAIN-SUFFIX,hdslb.com,CN-Media
DOMAIN-SUFFIX,iqiyi.com,CN-Media
DOMAIN-SUFFIX,qiyi.com,CN-Media
DOMAIN-SUFFIX,v.qq.com,CN-Media
DOMAIN-SUFFIX,qq.com,CN-Media
DOMAIN-SUFFIX,youku.com,CN-Media
DOMAIN-SUFFIX,mgtv.com,CN-Media
DOMAIN-SUFFIX,163.com,CN-Media
DOMAIN-SUFFIX,music.126.net,CN-Media
DOMAIN-SUFFIX,ximalaya.com,CN-Media
DOMAIN-SUFFIX,kugou.com,CN-Media
DOMAIN-SUFFIX,kuwo.cn,CN-Media

# Domestic CN Apps & E-Commerce (国内服务与购物)
DOMAIN-SUFFIX,taobao.com,BackToCN
DOMAIN-SUFFIX,tmall.com,BackToCN
DOMAIN-SUFFIX,alibaba.com,BackToCN
DOMAIN-SUFFIX,alipay.com,BackToCN
DOMAIN-SUFFIX,jd.com,BackToCN
DOMAIN-SUFFIX,pinduoduo.com,BackToCN
DOMAIN-SUFFIX,baidu.com,BackToCN
DOMAIN-SUFFIX,weibo.com,BackToCN
DOMAIN-SUFFIX,zhihu.com,BackToCN
DOMAIN-SUFFIX,douyin.com,BackToCN
DOMAIN-SUFFIX,xiaohongshu.com,BackToCN
DOMAIN-SUFFIX,xhslink.com,BackToCN
DOMAIN-SUFFIX,cn,BackToCN
GEOIP,CN,BackToCN,no-resolve

# Ads & Tracking Blocking
DOMAIN-KEYWORD,adservice,Reject
DOMAIN-SUFFIX,doubleclick.net,Reject
DOMAIN-SUFFIX,google-analytics.com,Reject-Tiny-Gif

# LAN & Overseas Default (海外网站保持直连)
IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
IP-CIDR,10.0.0.0/8,DIRECT,no-resolve
FINAL,Global-Direct,dns-failed

[Host]
api.internal.local = 192.168.1.100

[URL Rewrite]
^https?://.*\\.doubleclick\\.net reject

[MITM]
hostname = *.bilibili.com, *.iqiyi.com, *.music.163.com
h2 = true
tcp-connection = true
`,
  },
];
