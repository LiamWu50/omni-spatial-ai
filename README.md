# Omni-Spatial AI

Omni-Spatial AI 是一个开源的、以 AI 为核心的空间智能平台。它将现代 Web 技术与大型语言模型（LLM）相结合，旨在探索下一代地理空间应用的用户体验。

https://github.com/user-attachments/assets/b367868d-8438-4c3a-a589-e241e3a1370b

## ✨ 核心特性

- **🗺️ 现代地图界面**: 基于 Leaflet.js 构建的动态、高性能的地图界面，支持多种底图切换。
- **🤖 AI 助手**: 集成通义千问（Dashscope）模型，可通过自然语言与地图进行交互，例如：
  - “飞到北京”
  - “加载一个 GeoJSON 数据”
  - “把图层颜色改成红色”
- **🔧 客户端工具调用**: AI 模型可以直接调用在客户端定义的工具，实现对地图的实时控制。
- **⬆️ 数据管理**: 支持通过文件上传、URL 或系统内置数据集加载 GeoJSON 数据，并在图层管理器中进行管理。
- **✏️ 地图绘制与测量**: 提供在地图上绘制点、线、面以及进行距离和面积测量的工具。
- **🎨 灵活的样式定制**: 可以通过 AI 指令或手动操作修改图层的显示样式。
- **🌐 可扩展的后端服务**: 支持通过环境变量灵活配置地理编码等后端服务。

## 🚀 技术栈

- **前端**:
  - **框架**: [Next.js](https://nextjs.org/) (App Router)
  - **UI 库**: [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
  - **地图**: [Leaflet.js](https://leafletjs.com/)
  - **AI 聊天 UI**: [@assistant-ui/react](https://github.com/assistant-ui/react)
- **后端**:
  - **API**: Next.js API Routes
  - **AI**: [Vercel AI SDK](https://sdk.vercel.ai/docs), [通义千问 (Dashscope)](https://help.aliyun.com/document_detail/2587493.html)
- **语言**: TypeScript
- **构建与部署**: Docker

## 🛠️ 本地开发

### 1. 环境准备

- [Node.js](https://nodejs.org/) (>= 20.x)
- [pnpm](https://pnpm.io/) (推荐)

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

在项目根目录创建一个 `.env.local` 文件，并填入必要的环境变量。

```env
# 阿里云 Dashscope API Key
DASHSCOPE_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# (可选) 地理编码服务配置
# 如果不配置，默认会尝试使用 LocationIQ (需要 LOCATIONIQ_API_KEY)
# MAP_GEOCODER_CONFIG='''{"urlTemplate":"https://...","lngPath":"...","latPath":"..."}'''

# (可选) LocationIQ API Key (作为地理编码的回退选项)
# LOCATIONIQ_API_KEY="pk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> **提示**:
>
> - 你需要一个有效的 `DASHSCOPE_API_KEY` 才能使用 AI 助手功能。
> - 地理编码功能（例如“飞到北京”）需要配置 `MAP_GEOCODER_CONFIG` 或 `LOCATIONIQ_API_KEY`。

### 4. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 上运行。

### 5. 其他脚本

- `pnpm build`: 构建生产版本。
- `pnpm start`: 运行生产版本。
- `pnpm lint`: 使用 Biome.js 进行代码检查和格式化。
- `pnpm test`: 运行测试。

## 📂 项目结构

```
.
├── src
│   ├── app                 # Next.js App Router 页面和路由
│   │   ├── (app)           # 主应用页面 (地图)
│   │   ├── (auth)          # 认证页面 (占位)
│   │   └── api             # API 路由 (例如 /api/chat)
│   ├── assets              # 静态资源 (图片、图标等)
│   ├── components          # 通用 UI 组件
│   ├── features            # 核心功能模块
│   │   ├── assistant       # AI 助手相关
│   │   │   ├── components  # 助手 UI 组件
│   │   │   ├── hooks       # 助手运行时和交互逻辑
│   │   │   └── lib         # 助手与地图交互的协议 (contracts)
│   │   └── map             # 地图相关
│   │       ├── components  # 地图 UI 组件 (工具栏、图层管理器等)
│   │       ├── hooks       # 地图 UI 逻辑 Hooks
│   │       ├── lib         # 地图常量、工具函数等
│   │       └── services    # 地图核心服务 (MapRuntime, LayerManager)
│   ├── lib                 # 通用库和工具函数
│   └── server              # 服务端逻辑 (Next.js 环境)
│       └── chat            # 聊天 API 实现
│           ├── prompts.ts  # AI 系统提示
│           └── tools       # AI 工具定义
├── tests                   # 测试文件
├── .env.development        # 开发环境变量
├── next.config.ts          # Next.js 配置文件
└── tsconfig.json           # TypeScript 配置文件
```

## 🧠 AI 能力集成

本项目的核心是 AI 助手与地图的深度集成。

- **工作流程**:
  1.  用户在前端输入自然语言指令。
  2.  请求被发送到后端的 `/api/chat` 路由。
  3.  后端将用户的指令和预定义的工具列表一起发送给通义千问模型。
  4.  模型根据用户意图，决定是否以及如何调用一个或多个工具。
  5.  如果需要调用工具，模型会返回一个包含工具名称和参数的 JSON 对象。
  6.  后端执行相应的工具函数 (定义于 `src/server/chat/tools/`)。
  7.  工具函数返回一个 `clientActions` 数组，其中包含了需要在客户端执行的具体操作（例如 `view.fly_to`, `layer.add`）。
  8.  `clientActions` 被流式传输回前端。
  9.  前端的 `useAssistantRuntime` Hook 接收这些 `clientActions`，并通过 `MapRuntime` 服务执行实际的地图操作。

- **工具扩展**:
  你可以通过在 `src/server/chat/tools/` 目录下添加新的工具定义来扩展 AI 助手的能力。每个工具都需要定义其 `description` (用于让 AI 理解其功能) 和 `inputSchema` (使用 Zod 定义输入参数)。
