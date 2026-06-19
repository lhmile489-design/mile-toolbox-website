# 个人工具箱网站 — 后端

> Spring Boot 3.5 + MyBatis-Plus + MySQL + Redis + Sa-Token 双域。
> 提供 API、业务逻辑与重型文件处理。配套：前台 React、后台 Vue（`mile-toolbox-EndWebsite`）。

---

## 技术栈

| 项 | 选型 |
|---|---|
| 框架 | Spring Boot 3.5.3 / Java 17 |
| 持久层 | MyBatis-Plus 3.5.7（列名全驼峰，`map-underscore=false` + `table-underline=false`） |
| 鉴权 | Sa-Token 1.40.0 双域（USER 前台用户 / ADMIN 后台管理） |
| 缓存/限流 | Redis（Lettuce） |
| 迁移 | Flyway（启动自动执行 `db/migration/Vn__*.sql`） |
| 密码 | BCrypt（spring-security-crypto） |
| 文件处理 | Apache PDFBox 3.0.3、Thumbnailator + TwelveMonkeys ImageIO |
| 地图 | 维智地图（Wayz）REST，正/逆地理编码 |

---

## 模块一览

```
controller/        REST 接口（含 admin/ 子包）
  ├ UserController         前台用户：注册/登录/信息/资料/改密
  ├ ToolController         工具中心：分类/清单下发/详情/热门/使用上报
  ├ FavoriteController     收藏：收藏/取消/列表
  ├ UsageController        最近使用
  ├ PdfController          PDF：合并/拆分/水印/加密/图片互转
  ├ ImageController        图片格式转换
  ├ QueryController        查询类：geocode（维智地理编码）
  └ admin/                 后台：认证/工具/分类/用户/统计
service / service.impl     业务逻辑
mapper                     MyBatis-Plus BaseMapper
domain / dto / vo          实体 / 入参 / 出参
common                     Result<T> / PageResult<T>
exception                  ErrCode / BusinessException / GlobExceptionHandler
ratelimit                  @RateLimit + RateLimiter(Redis) + AOP 切面
config / satoken           MyBatis-Plus / Sa-Token 双域 / CORS / 默认管理员初始化
```

---

## 本地启动

1. **建库**：MySQL 8 建库 `mile_toolbox`（utf8mb4）。
2. **本地配置**：复制 `src/main/resources/application-local.yml.example` 为 `application-local.yml`，填入 DB / Redis / 维智 app-key（该文件已 gitignore，密钥不进仓库）。
3. **启动**：`./mvnw spring-boot:run`（端口 8989）。Flyway 自动建表 + 灌入 7 分类 + 31 工具种子。
4. **验证**：`GET http://localhost:8989/ping` 返回 `{"code":"200"}`。
5. 默认管理员：`admin / admin123456`（首次启动自动创建，登录后请改密）。

---

## 工具实现状态（一期）

| 类别 | 工具 | 状态 |
|---|---|---|
| 文件 · PDF | 合并 / 拆分 / 水印 / 加密 / 图片互转 | ✅ 已实现（单测覆盖） |
| 文件 · 图片 | 格式转换（含 WebP/TIFF 读取） | ✅ 已实现（单测覆盖） |
| 查询 | geocode 经纬度↔地址（维智） | ✅ 已实现（真实联网验证） |
| 查询 | ip-location（ip2region 离线库） | ✅ 已实现（真实 xdb 验证） |
| 查询 | phone-location（手机号归属地，apihz.cn） | ✅ 已实现（真实接口验证） |
| 查询 | zipcode（按地区查邮编，本地数据集） | ✅ 已实现（2995 区县，真实数据验证） |
| 转换 | doc-convert（doc→MD 等，Pandoc） | ✅ 已实现（真实 Pandoc 验证；服务器需装 pandoc） |
| 文件产物存储 | 腾讯云 COS（save=true 返回 URL） | ✅ 已接入（可选开关） |
| 前端处理类（20 个） | 单位/进制/JSON/Hash/二维码等 | 前端实现，后端只下发清单 + 记录使用 |

---

## 测试与验证

```bash
./mvnw clean compile           # 编译
./mvnw test                    # 全量测试（30 用例，需本地 MySQL + Redis 供 contextLoads）
./mvnw test -Dtest=PdfToolServiceImplTest   # 单类（纯逻辑/Mockito，无需依赖）
```

测试资产（8 类 30 用例）：PDF 五件套、图片转换、geocode 解析、用户/收藏/工具/使用记录核心不变量、限流器、Spring 上下文冒烟。

---

## 文档

- 立项：`docs/产品开发文档.md`、`docs/数据库设计.md`、`docs/错误码与响应规范.md`、`docs/部署-宝塔外部依赖安装.md`
- 对接：`docs/develop/前台-*.md`、`docs/develop/后台管理-对接文档.md`
- 踩坑：`docs/踩坑记录.md`
