# Admin Template (Vue 3)

通用后台管理系统前端模板。**内置 mock，开箱即跑，无需任何后端**；接真实后端时只需关掉 mock 并按本文档实现接口即可。

技术栈：Vue 3.5 + Vite 8 + TypeScript + Element Plus + Pinia + Vue Router 5 + ECharts + Axios。

---

## 1. 快速开始

```bash
npm install
npm run dev          # 启动开发服务器，默认 http://localhost:3300
```

打开浏览器，使用演示账号登录：

| 用户名 | 密码 |
|--------|----------|
| admin  | admin123 |

其它命令：

```bash
npm run build        # 类型检查 + 生产构建，产物在 dist/
npm run preview      # 本地预览构建产物
npm run type-check   # 仅类型检查
npm run lint         # ESLint 自动修复
npm run format       # Prettier 格式化 src/
```

---

## 2. 目录结构

```
src/
├── api/              # 接口定义（按模块拆分），是前后端契约的唯一来源
│   ├── types.ts      #   所有数据类型（UserInfo/PageResult/Member/OrderRow…）
│   ├── auth.ts       #   登录/登出/当前用户
│   ├── dashboard.ts  #   看板统计/趋势/占比
│   ├── member.ts     #   成员管理（通用 CRUD 示例）
│   └── order.ts      #   订单查询（只读筛选示例）
├── mock/             # 内置 mock 层（仅开发用，接真实后端后会被绕过）
│   ├── index.ts      #   axios adapter，拦截 /api/* 返回假数据
│   └── data.ts       #   内存假数据
├── layout/           # 整体布局（侧边栏 + 顶栏），菜单由路由自动生成
├── router/           # 路由 = 菜单的单一事实来源
├── stores/           # Pinia（auth 鉴权状态）
├── styles/           # theme.css（主题色/字体令牌，换主题改这里）
├── utils/            # request.ts（Axios 封装 + 统一响应/错误码处理）
└── views/            # 页面：login / dashboard / member / order
```

---

## 3. 后端如何对接（重点）

### 3.1 第一步：关闭 mock，指向真实后端

模板默认开启内置 mock。接真实后端时，在项目根目录新建 `.env.local`：

```bash
# 关闭内置 mock，走真实后端
VITE_USE_MOCK=false
# 真实后端基址（二选一）：
# 方式A：直接写后端完整地址
VITE_API_BASE=http://localhost:8080/api
```

或者用 Vite 代理避免跨域（推荐开发期）：保持 `VITE_API_BASE=/api`，
在 `vite.config.ts` 的 `server.proxy` 把 `/api` 代理到后端（已预置，改 target 即可）：

```ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
  },
}
```

> 所有请求的基址逻辑见 `src/utils/request.ts`。前端请求路径都形如 `/api/xxx`，
> 后端只需把这些路径实现出来即可。

### 3.2 统一响应结构（必须遵守）

后端**所有接口**都返回如下 JSON 结构（`src/utils/request.ts` 据此解析）：

```json
{ "code": "200", "msg": "success", "data": <业务数据> }
```

- `code`：字符串。成功固定为 `"200"`，前端会自动取出 `data` 给业务代码。
- `msg`：提示信息。非成功时前端用它弹错误提示。
- `data`：业务数据，可为对象/数组/null。

约定错误码（可按需扩展，但**鉴权失效码必须独立**）：

| code | 含义 | 前端行为 |
|--------|--------------------|----------------------------|
| 200    | 成功               | 取 data |
| 10005  | 未登录/登录失效    | **清 token + 跳登录页**（仅此码登出） |
| 10002  | 数据不存在         | 弹 msg |
| 10102  | 用户名或密码错误   | 弹 msg |
| 其它   | 业务错误           | 弹 msg，不登出 |

> 关键：**鉴权失效码（10005）必须与普通业务/系统错误码分开**，否则任意接口报错都会把用户踢去登录页。

### 3.3 鉴权（token）

- 登录成功后，后端在 `data` 里返回 `token`，前端存到 `localStorage`（key=`admin-template-token`）。
- 之后每个请求，前端自动在请求头加 `Authorization: <token>`。
- 后端校验该头部即可；失效时返回 `code=10005`。

### 3.4 需要实现的接口清单

下面是模板内置页面用到的全部接口。**路径、入参、出参以 `src/api/*.ts` 与 `src/api/types.ts` 为准**（这是唯一契约来源）。

#### 认证 `src/api/auth.ts`
| 方法 | 路径 | 入参 | data 出参 |
|------|---------------|----------------------|--------------------------------------------|
| POST | /auth/login   | `{username,password}`| `{ token, user:{id,username,nickname,roles[]} }` |
| POST | /auth/logout  | —                    | null |
| GET  | /auth/info    | —                    | `{id,username,nickname,roles[]}` |

#### 看板 `src/api/dashboard.ts`
| 方法 | 路径 | 入参 | data 出参 |
|------|--------------------------|---------|--------------------------------------------------|
| GET  | /dashboard/stats         | —       | `{userCount,orderCount,revenue,todayVisits}` |
| GET  | /dashboard/trend         | `days`  | `[{date,count}]`（按日，可直接画折线） |
| GET  | /dashboard/category-share| —       | `[{name,value}]`（饼图） |

#### 成员管理（通用 CRUD 范式） `src/api/member.ts`
| 方法 | 路径 | 入参 | data 出参 |
|--------|------------------------|--------------------------------------|------------------|
| GET    | /member/page           | `page,size,keyword?,role?,status?`   | `PageResult<Member>` |
| POST   | /member                | Member 字段                          | 新建的 Member |
| PUT    | /member                | 含 id 的 Member 字段                 | 更新后的 Member |
| PUT    | /member/{id}/status    | `status`（query，0正常/1禁用）        | null |
| DELETE | /member/{id}           | —                                    | null |

#### 订单查询（只读列表 + 筛选） `src/api/order.ts`
| 方法 | 路径 | 入参 | data 出参 |
|------|-------------|-----------------------------|------------------|
| GET  | /order/page | `page,size,keyword?,status?`| `PageResult<OrderRow>` |

#### 通用分页结构 `PageResult<T>`
```json
{ "list": [ /* T[] */ ], "total": 100, "page": 1, "size": 10 }
```

> 后端联调时可对照 `src/mock/index.ts` —— 里面每个接口的 mock 实现就是一份「期望的输入输出样例」，按它返回即可与前端对齐。

---

## 4. 二次开发指南

### 4.1 新增一个页面 / 菜单

菜单**由路由自动生成**，无需改 layout。三步：

1. 在 `src/views/` 下新建页面，如 `views/product/index.vue`。
2. 在 `src/router/index.ts` 的根布局 `children` 里加一项：
   ```ts
   {
     path: 'product',
     name: 'product',
     component: () => import('@/views/product/index.vue'),
     meta: { title: '商品管理', icon: 'Goods' }, // 有 title 才会出现在菜单
   }
   ```
   `icon` 取 [Element Plus 图标](https://element-plus.org/zh-CN/component/icon.html) 名（已全局注册）。
3. 在 `src/api/` 加该模块的接口函数（参照 `member.ts`）。完成。

### 4.2 新增一个 CRUD 模块

直接复制 `src/views/member/index.vue` 与 `src/api/member.ts`，改成你的资源字段即可。
它已包含：列表 + 关键词/下拉筛选 + 分页 + 新增/编辑弹窗（带校验）+ 状态开关 + 删除确认。

### 4.3 换主题色

只改 `src/styles/theme.css` 顶部的 `--brand-primary` 系列变量，以及紧随其后的
`--el-color-primary` 系列（Element Plus 主色）即可全站生效。当前为暖橙 `#FF8C42`。

### 4.4 换 Logo / 应用名

- 浏览器标签图标：替换 `public/favicon.svg`。
- 页面标题：改 `index.html` 的 `<title>`。
- 侧边栏 / 登录页的「A」徽标与「Admin Template」名称：改 `src/layout/index.vue`、`src/views/login.vue`。

---

## 5. 说明

- 内置 mock 仅用于开发演示，生产构建（`VITE_USE_MOCK=false`）下不会拦截请求。
- `noUncheckedIndexedAccess` 已开启，类型更严格，写数组/对象索引访问时请注意可能为 `undefined`。
- 本模板不含后端代码，后端按 §3 契约用任意语言/框架实现即可（响应体保持 `{code,msg,data}` 约定）。
