# 米乐的百宝箱 · 前端（mile-toolbox-website）

> 个人在线工具箱的**前台**（面向用户）。React 19 + Create React App。
> 聚合编码转换、PDF/图片/文档处理、配色设计、加密哈希、地理/归属地查询、开发者工具等常用小工具，开箱即用、隐私友好。

---

## 技术栈

- **React 19** + Create React App（react-scripts 5）+ **react-router-dom v6**
- 轻量库：`crypto-js`（hash/对称加密）、`qrcode` + `jsqr`（二维码）、`js-yaml`（JSON↔YAML）、`diff`（文本对比）、`markdown-it`（Markdown）、`opencc-js`（简繁转换）
- 纯 CSS + 设计令牌（无 UI 框架）；Flat Design，品牌主题色 `#FF8C42`，**支持深色模式**
- 自研轻量 Context：i18n（中/英）、主题、鉴权、Toast、工具数据、登录弹窗（无额外状态库）

## 目录结构

```
src/
├── index.js               入口：Language/Theme/Toast/Auth/ToolData/Router/AuthModal 多 Provider
├── App.js                 布局壳：导航 + 路由 + 页脚 + 离线条
├── index.css / App.css    设计令牌(UI 约束 SoT，含深色覆盖) + 全站样式
├── api/                   接口层：http 封装、tools/user/favorite/usage/pdf/query
├── auth/                  AuthContext（登录态、10005 自动登出）
├── theme/                 ThemeContext（深/浅模式，跟随系统 + 持久化）
├── data/                  工具数据归一化 + ToolDataContext + 后端文件工具配置(pdfTools)
├── i18n/                  translations(中英字典) + LanguageContext
├── components/            Navbar/Hero/Categories/HotTools/Features/Footer/ToolCard/
│                          AuthModal(+Provider)/PdfToolRunner/MyTools/Toast/Reveal/Icons
├── pages/                 HomePage、ToolPage、Profile
└── tools/                 工具实现 + 注册表 registry + 共享 UI(ui.js)
```

## 本地开发

```bash
npm install
npm start          # http://localhost:3000
npm run build      # 生产构建
```

- **后端代理**：`package.json` 的 `proxy` 在 `npm start` 时把 `/tool`、`/user`、`/pdf`、`/image`、`/doc`、`/query` 等相对路径转发到后端（服务端转发，**免 CORS**）。
  - 当前指向正式后端 `http://134.175.77.51:9292`；要连本地后端改回 `http://localhost:8989` 并**重启** `npm start`。
- **环境变量**（`.env.development` / `.env.production`）：`REACT_APP_API_BASE` 留空走代理/同源；`npm run build` 读 `.env.production`（当前直连正式后端 `http://134.175.77.51:9292`）。
  - ⚠️ 直连（与前端不同源）需后端开 CORS；前端站点若用 HTTPS 会拦截 http 后端（混合内容）。生产**推荐** Nginx 反向代理同源（`REACT_APP_API_BASE` 留空），见 `docs/部署-宝塔完整部署教程.md §8`。
- ⚠️ `.env.development` 设 `DANGEROUSLY_DISABLE_HOST_CHECK=true`：规避 react-scripts 5 开启 proxy 后 `allowedHosts[0]` 的已知 bug（仅本地 dev server，不影响生产）。详见 `docs/踩坑记录.md`。

## 功能概览

- **工具中心**：分类浏览 + 搜索；清单由后端 `/tool/*` 下发（不硬编码），`favorited` 随登录态刷新。
- **用户系统**：注册/登录/登出弹窗、`10005` 自动登出；**个人中心 `/profile`**（资料编辑 + 修改密码）。
- **收藏 + 最近使用**：收藏星标、「我的工具」区（登录后可见）。
- **中英双语**：一键切换、持久化；动态文案优先用后端 `nameEn/descriptionEn`，本地兜底。
- **深色模式**：跟随系统、可切换、持久化、首屏防闪白。
- **Toast 通知**：登录/收藏/资料保存等操作的统一反馈。
- **限流处理**：`10306` 专门提示，不登出（仅 `10005` 登出）。
- **站点级体验**：工具组件按需懒加载（首屏 JS ~97KB gzip）、错误边界、PWA 离线（Service Worker，生产注册）、回到顶部、404 页、在线/离线提示、本地最近使用（游客）。
- **全局命令面板**：任意页面 `Ctrl/Cmd+K` 唤起，模糊搜索 + 最近使用 + 收藏，键盘上下选择回车直达（Navbar 也有入口）。
- **别名搜索**：搜 `md5`/`qr`/`正则`/`时间戳` 等俗称/缩写也能命中（`data/tools.js` 的 `TOOL_ALIASES` + `toolMatch`）。
- **工具页增强**：分类面包屑 chip、分享/复制链接（优先原生 `navigator.share`）、底部「同类工具」推荐。
- **安装到设备**：支持 PWA「添加到主屏」引导条（`beforeinstallprompt`），关闭后不再打扰。
- **异步任务框架（预留）**：面向耗时工具的「提交→轮询→下载」通用框架（`api/asyncTask.js` + 可复用 `AsyncTaskRunner`），与现有同步文件端点并存；联调演示页 `/async-demo`（未在导航暴露）。

### 工具实现（PRD 一期 31 个 + 二期新增 9 个，共 40 个）

- **前端本地工具（27）**：base64、url-encode、uuid、word-count、timestamp、radix-convert、password-gen、json-tool(含 JSON↔YAML)、regex-test、color-convert、gradient、hash、text-crypto、qrcode、idcard、unit-convert、image-compress、image-edit、palette、china-color、jwt-decode、case-convert、text-dedup、text-diff、markdown、cron-parser、chinese-convert；用完调 `POST /tool/use/{toolKey}` 上报。
  - 二期新增（7）：jwt-decode(JWT 解析)、case-convert(命名转换)、text-dedup(去重排序)、text-diff(文本对比)、markdown(预览)、cron-parser(Cron 解析+下次执行)、chinese-convert(简繁转换)。
  - 多数工具已做功能增强（v2）：base64 图片转码、hash 文件哈希+HMAC、color HSV/CMYK+WCAG 对比度、uuid v7/NanoID、qrcode 纠错级别+配色、unit 10 类换算、regex 替换+捕获组、password 口令短语、word-count 阅读时长+词频、timestamp 时区、idcard 测试号+生肖星座、palette 图片取色+导出、gradient 多色标+conic+预设、json-tool 排序键+转 TS。
- **后端文件工具**：PDF 五件套（merge/split/watermark/encrypt/pdf-image）、image-convert、doc-convert；统一「上传→处理→下载」，并支持 **`save=true` 保存到 COS 返回分享链接**（未配 COS 自动回退下载）。
- **后端查询工具**：geocode（正/逆向）、ip-location、phone-location、zipcode。
- **后端联网工具**：currency（实时汇率换算）、weather（城市实时天气 + 多天预报）；公开 + 限流（30 次/60 秒），实时外呼第三方。

> 文件工具的下载/JSON 区分见 `src/api/pdf.js`；查询工具调用见 `src/api/query.js`。

## 对接文档

见仓库根 `docs/develop/`：用户与工具中心、PDF 文件工具、后端工具处理。前端提出的需求/缺陷见根 `docs/前台-*.md`。

## 设计

设计令牌（颜色/字体/圆角/阴影 + 深色覆盖）集中在 `src/index.css` 顶部，作为 UI 约束的单一事实来源，改一处全站生效。
