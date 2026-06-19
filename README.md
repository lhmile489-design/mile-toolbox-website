# Mile 工具箱（Mile Toolbox）

一个面向个人用户的**在线工具箱网站**：聚合查询、转换、文件处理、设计配色、加密编码、开发者工具等 40+ 实用小工具。轻量工具在浏览器本地完成（隐私友好、即开即用），重型工具（PDF / 文档转换 / 图片格式转换 / 地理编码等）上传服务器处理。工具清单由后端统一下发，前端不硬编码。

> 本仓库为**全栈源码**：前台（React）+ 后端（Spring Boot）+ 管理后台（Vue3）+ 通用后台模板。

---

## ✨ 功能介绍

### 工具能力（按分类）
| 分类 | 代表工具 |
|---|---|
| 查询 | 手机号归属地、IP 归属地、邮编查询、经纬度↔地址（地理编码）、天气查询、身份证校验 |
| 转换 | 单位/进制/时间戳转换、颜色格式转换、货币汇率换算、简繁转换、文档转换（doc/MD/Office/PDF） |
| 文件处理 | PDF 合并/拆分/水印/加密/PDF↔图片、图片格式转换（含 WebP）/压缩/编辑 |
| 设计配色 | 配色大全、中国传统色、渐变生成器、图片取色 |
| 加密编码 | 文本加密（AES/DES/RSA）、Hash、Base64、URL 编解码、密码生成、二维码 |
| 开发者 | JSON 工具、正则测试、UUID、JWT 解析、Cron 表达式、命名转换 |
| 文本处理 | 字数统计、文本对比、Markdown 预览、去重排序 |

### 平台功能
- **用户系统**：注册 / 登录 / 个人资料 / 修改密码（Sa-Token 鉴权，密码 BCrypt 存储）
- **工具中心**：分类浏览、清单下发、搜索、详情
- **收藏 & 最近使用 & 热门排行**（支持「最多次数」与「最多人用」双维度）
- **文件处理**：同步处理 + 异步任务框架（提交 → 轮询 → 下载）+ 临时产物 TTL 清理
- **对象存储**：可选接入腾讯云 COS，文件产物返回外链
- **限流**：基于 Redis 的接口限流（AOP 注解，零侵入）
- **管理后台**：工具/分类/用户管理、统计看板（ECharts）、文件任务监控

---

## 🧱 技术栈

| 端 | 技术栈 |
|---|---|
| 前台（用户站点） | React + Vite |
| 后端 | Spring Boot 3.5 · Java 17 · MyBatis-Plus · MySQL 8 · Redis · Sa-Token（双域） · Flyway · 腾讯云 COS · Pandoc |
| 管理后台 | Vue 3.5 · TypeScript · Vite · Vue Router · Pinia · Element Plus · ECharts · Axios |
| 通用后台模板 | Vue 3.5 · Vite · Element Plus（开箱即用的后台脚手架，内置 mock） |

---

## 📁 项目结构

```
mile-toolbox/
├── mile-toolbox-website/      # 前台（React）— 面向用户的工具站点
├── mile-toolBox-EndProject/   # 后端（Spring Boot）— API / 业务 / 文件处理
├── mile-toolbox-EndWebsite/   # 管理后台（Vue3 + Element Plus）
├── admin-template-vue/        # 通用后台管理系统模板（可复用脚手架）
└── README.md
```

各端职责：

- **mile-toolbox-website**：React 前台，按后端下发的工具清单渲染，前端工具本地执行，后端工具调用 API。
- **mile-toolBox-EndProject**：Spring Boot 后端，提供全部 API、重型文件处理、鉴权、限流、对象存储。MyBatis-Plus + Flyway（启动自动迁移建表）。
- **mile-toolbox-EndWebsite**：运营管理后台，工具/分类/用户管理、统计看板、文件任务监控。
- **admin-template-vue**：从本项目后台抽象出的通用后台模板，内置 mock 可独立运行，供新项目快速起步。

---

## 🚀 启动方式

> 前置环境：JDK 17、Maven、Node.js 18+、MySQL 8、Redis。

### 1. 后端 `mile-toolBox-EndProject`

后端依赖 MySQL / Redis，且**真实配置/密钥不在仓库中**，需自行创建本地配置：

```bash
cd mile-toolBox-EndProject

# 1) 创建数据库（utf8mb4）；表结构由 Flyway 启动时自动迁移建立
#    CREATE DATABASE mile_toolbox CHARACTER SET utf8mb4;

# 2) 在 src/main/resources/ 下创建 application-local.yml，填入：
#    - spring.datasource（MySQL 地址/账号/密码）
#    - spring.data.redis（Redis 地址/端口/密码）
#    - toolbox.*（可选：Pandoc 路径、第三方接口 key、腾讯云 COS 等）
#    （该文件含密钥，已被 .gitignore 排除，不在仓库内）

# 3) 启动（默认端口 8989）
./mvnw spring-boot:run          # Linux/Mac
mvnw.cmd spring-boot:run        # Windows

# 打包部署
./mvnw clean package -DskipTests
java -jar target/*.jar --spring.config.additional-location=file:/path/to/config/
```

### 2. 前台 `mile-toolbox-website`（React）

```bash
cd mile-toolbox-website
npm install
npm run dev      # 本地开发
npm run build    # 生产构建
```

接口基址通过环境变量配置，开发时指向后端（或经反向代理 `/api`）。

### 3. 管理后台 `mile-toolbox-EndWebsite`（Vue3）

```bash
cd mile-toolbox-EndWebsite
npm install
npm run dev      # 本地开发（默认端口见 vite.config）
npm run build    # 生产构建
```

### 4. 通用后台模板 `admin-template-vue`

```bash
cd admin-template-vue
npm install
npm run dev      # 内置 mock，开箱即跑（演示账号 admin / admin123）
npm run build
```

---

## 🔧 部署概览

- 后端打 fat jar，由 Nginx 反向代理（`/api/` → 后端端口），前端 / 后台静态产物由 Nginx 托管。
- 后端端口仅本机监听，不直接对外；MySQL / Redis 仅本机。
- 真实密钥仅存于服务器侧 `application-local.yml`，不进仓库。
- 管理后台默认管理员账号首次启动自动创建，**部署后请立即修改默认密码**。

---

## ⚠️ 说明

- 本仓库仅含**源码**；开发文档、对接文档、部署教程、数据库脚本等内部资料不在此公开仓库中。
- 配置密钥（数据库 / Redis / 第三方 API / 对象存储）均不入库，需按上述说明在本地 / 服务器自行配置。

---

## 📄 License

本项目为个人项目，未附带开源许可证；如需使用请联系作者。
