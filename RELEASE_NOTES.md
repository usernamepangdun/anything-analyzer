# Anything Analyzer v3.0.0

## MITM 代理抓包 — 突破浏览器边界

v3.0.0 最大的变化：**新增内置 HTTPS 中间人代理**，支持捕获系统级/外部应用的 HTTP(S) 流量。现在你不仅可以分析内嵌浏览器里的请求，还可以抓取 Postman、curl、Python 脚本、移动端 App 等任何 HTTP 客户端的流量，统一送入 AI 分析。

### 核心特性

- **双通道捕获** — 浏览器内通过 CDP 抓包 + 外部应用通过 MITM 代理抓包，数据统一汇入同一会话
- **一键 CA 证书管理** — 自动生成根 CA，支持安装/卸载/重新生成/导出，跨平台支持（Windows/macOS/Linux）
- **系统代理集成** — 一键设为系统代理，无需手动配置
- **纯代理模式** — 创建 Session 时不填 URL，专注捕获外部应用流量
- **按域名签发子证书** — LRU 缓存，高性能 TLS 解密
- **请求来源标记** — 请求列表中区分「CDP」和「代理」来源

### 使用方式

1. Settings → MITM 代理 → 安装 CA 证书 → 启用代理
2. 开启「设为系统代理」或手动指定 `http://127.0.0.1:8888`
3. 正常操作目标应用，所有 HTTP(S) 请求自动捕获
4. 停止捕获 → AI 分析，与浏览器抓包数据统一处理

## 其他改进

- **Settings UI 重构** — 分模块组件化（通用 / LLM / 代理 / MCP Server / MITM 代理），体验更清晰
- **Domain 过滤** — 请求列表支持按域名分组过滤 + 部分匹配搜索
- **数据库迁移** — 新增 `source` 字段区分请求来源（CDP vs 代理）
- **多项 Bug 修复** — 存储快照捕获、LLM 请求体特殊字符处理等

## 下载

| 平台 | 文件 |
|------|------|
| Windows | `Anything-Analyzer-Setup-3.0.0.exe` |
| macOS (Apple Silicon) | `Anything-Analyzer-3.0.0-arm64.dmg` |
| macOS (Intel) | `Anything-Analyzer-3.0.0-x64.dmg` |
| Linux | `Anything-Analyzer-3.0.0.AppImage` |
