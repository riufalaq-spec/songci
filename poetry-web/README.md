# Poetry Web — React Frontend

宋词别苑前端应用，基于 React + Vite + Tailwind CSS 构建，以中国传统宣纸美学为设计语言，提供宋词浏览、搜索、收藏等沉浸式体验。

## 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| React | ^18.3.1 | UI 框架 |
| React Router DOM | ^6.26.0 | 客户端路由 |
| Zustand | ^4.5.0 | 轻量状态管理 |
| Axios | ^1.7.0 | HTTP 客户端 |
| Tailwind CSS | ^3.4.13 | 原子化样式 |
| TypeScript | ^5.5.0 | 类型安全 |
| Vite | ^5.4.0 | 构建工具 |

## 目录结构

```
poetry-web/
├── index.html              # HTML 入口
├── package.json            # npm 配置
├── vite.config.ts          # Vite 配置（代理、端口）
├── tailwind.config.js      # Tailwind 主题（宣纸美学色彩）
├── postcss.config.js       # PostCSS 配置
├── tsconfig.json           # TypeScript 配置
├── src/
│   ├── main.tsx            # React 入口
│   ├── App.tsx             # 路由定义
│   ├── index.css           # 全局样式（Tailwind 指令）
│   ├── api/
│   │   └── index.ts        # Axios 实例、拦截器、所有 API 调用
│   ├── store/
│   │   └── auth.ts         # Zustand 认证状态（Token / 用户信息）
│   ├── pages/
│   │   ├── Home.tsx        # 首页：每日一词、搜索、推荐
│   │   ├── ThreeHundred.tsx # 宋词三百首卡片流
│   │   ├── Poets.tsx       # 诗人列表 + 诗人详情
│   │   ├── MyCollection.tsx # 我的雅集（收藏/点赞/历史）
│   │   └── Auth.tsx        # 登录 / 注册 / 忘记密码
│   ├── components/
│   │   ├── Layout.tsx      # 应用外壳（顶部导航）
│   │   ├── AuthGuard.tsx   # 路由鉴权守卫
│   │   ├── PoemCard.tsx    # 词作卡片
│   │   ├── PoetCard.tsx    # 诗人卡片
│   │   ├── PoemDetailDialog.tsx # 词作详情弹窗
│   │   ├── SearchPopover.tsx    # 搜索结果悬浮面板
│   │   ├── Toast.tsx       # Toast 提示组件
│   │   └── Skeleton.tsx    # 加载骨架屏
│   └── utils/
│       ├── highlight.tsx   # 搜索关键词高亮
│       └── paragraphs.ts   # 词作段落格式化
└── dist/                   # 构建产物
```

## 路由规划

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页，每日一词 + 智能搜索 + 推荐词牌/名家 |
| `/three-hundred` | ThreeHundred | 宋词三百首精选，卡片流 + 分页 |
| `/poets` | Poets | 诗人网格列表 |
| `/poets/:id` | Poets (详情) | 诗人生平简介 + 作品归档 |
| `/my-collection` | MyCollection | 我的雅集（需登录） |
| `/auth` | Auth | 登录 / 注册 / 忘记密码 |
| `*` | Redirect | 重定向至首页 |

## 设计风格

采用中国传统宣纸美学，核心色板定义在 `tailwind.config.js`：

```js
colors: {
  accent: { red: '#C93726' },       // 朱红强调色
  bg: { paper: '#F9F6F0' },         // 宣纸背景
  border: { subtle: '#E8E2D8' },    // 淡墨线
}
```

字体方案：Playfair Display（英文标题）、Noto Serif SC / Source Han Serif SC（中文正文）。

## 启动

```bash
cd poetry-web
npm install
npm run dev
# 浏览器访问 http://localhost:3000
```

## 构建

```bash
npm run build      # TypeScript 检查 + Vite 构建
npm run preview    # 本地预览构建产物
```

## 开发说明

### API 代理

`vite.config.ts` 中配置了开发代理：

- 前端运行在 `localhost:3000`
- 所有 `/api` 请求自动代理至后端 `localhost:8080`

### 状态管理

使用 Zustand 管理全局状态，主要 store：

- **auth.ts**: 存储 JWT Token、用户信息，提供 login/logout 方法。Token 持久化至 localStorage。

### API 客户端

`src/api/index.ts` 封装了所有后端接口调用，包含：

- Axios 实例创建与 base URL 配置
- 请求拦截器：自动附加 Bearer Token
- 响应拦截器：统一错误处理、Token 过期自动登出

### 组件说明

| 组件 | 说明 |
|------|------|
| `Layout` | 应用外壳，包含顶部导航栏（首页/三百首/文人墨客/我的雅集） |
| `AuthGuard` | 路由守卫，未登录用户访问受保护页面时跳转至登录页 |
| `PoemCard` | 词作卡片，展示词牌名、作者、内容摘要 |
| `PoetCard` | 诗人卡片，展示姓氏印章、姓名、生卒年、代表作 |
| `PoemDetailDialog` | 词作详情弹窗，支持横排/竖排切换，底部互动栏 |
| `SearchPopover` | 搜索框下方的悬浮结果面板，分栏展示词牌/诗人/内容 |
| `Skeleton` | 加载骨架屏，提升页面加载感知体验 |
| `Toast` | 非阻塞式消息提示 |
