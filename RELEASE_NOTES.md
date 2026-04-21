# Anything Analyzer v3.5.1

## 修复

- **MITM 代理上游代理支持** — MITM 代理服务器现在正确通过已配置的上游代理（HTTP/HTTPS/SOCKS5）转发出站连接，修复外部浏览器通过 MITM 代理抓包时无法访问需要翻墙站点的问题

## 改进

- **CONNECT 隧道健壮性** — 修复代理响应解析中的 Buffer 编码问题和尾部数据丢失，HTTPS 代理类型正确使用 TLS 连接
- **超时保护** — 上游代理 CONNECT 隧道添加 30 秒超时，防止连接挂起和 socket 泄漏
- **请求体累积性能** — 修复 O(n^2) Buffer.concat 问题，改用计数器追踪大小

## 下载

| 平台 | 文件 |
|------|------|
| Windows | `Anything-Analyzer-Setup-3.5.1.exe` |
| macOS (Apple Silicon) | `Anything-Analyzer-3.5.1-arm64.dmg` |
| macOS (Intel) | `Anything-Analyzer-3.5.1-x64.dmg` |
| Linux | `Anything-Analyzer-3.5.1.AppImage` |
