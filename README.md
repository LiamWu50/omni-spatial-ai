# OmniSpatial AI

OmniSpatial AI 是一个基于 Next.js 16、TypeScript、Leaflet、assistant-ui 与 AI SDK 构建的空间智能工作台 MVP。

当前仓库已经收敛为 **Leaflet 单引擎架构**，地图功能、助手运行时和页面装配统一收口在 `src/features/map`。

## 快速启动

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
pnpm dev
pnpm lint
pnpm format
pnpm typecheck
pnpm test
```

## 当前结构

```text
src/
├── app/
│   ├── (app)/page.tsx
│   ├── (auth)/login/page.tsx
│   ├── layout.tsx
│   └── styles/globals.css
├── components/
│   ├── providers/
│   └── ui/
├── features/
│   └── map/
│       ├── assistant/
│       │   ├── components/
│       │   └── runtime/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── services/
│       ├── index.ts
│       └── types.ts
└── lib/
    ├── gis/
    └── map/
```

## 当前能力

- Leaflet 单实例运行时门面：`src/features/map/services/map-runtime.ts`
- 地图工作台入口：`src/features/map/components/map-shell.tsx`
- assistant-ui + AI SDK 地图助手 runtime：`src/features/map/assistant/runtime/use-map-assistant-runtime.ts`
- 地图 AI Tool Calling：飞到地点、回到初始视角、定位当前位置、加载 GeoJSON、修改图层样式
- 地图本地指令分流兜底：定位、重置视角、切换底图、切换图层面板
- 临时多轮 AI 对话：普通问答走 `/api/chat`，刷新页面后不保留历史
- GeoJSON / JSON 图层上传、图层管理、底图切换

## 环境变量

| 变量 | 说明 |
|---|---|
| `APP_URL` | 本地访问地址，默认 `http://localhost:3000` |
| `DASHSCOPE_API_KEY` | DashScope/Qwen 兼容 OpenAI 接口的 API Key，用于 AI 对话 |
| `MAP_GEOCODER_CONFIG` | 可选，JSON 字符串。配置地理编码服务模板，如 `urlTemplate`、`resultPath`、`lngPath`、`latPath` |
| `MAP_SYSTEM_DATASETS` | 可选，JSON 字符串。注册系统内数据源，支持 `url` 或内联 `geojson` 两种模式 |

## 架构概览

1. `src/app/(app)/page.tsx` 作为根路由入口渲染地图工作台。
2. `MapShell` 负责页面装配、图层管理、助手面板与地图挂载。
3. `MapRuntime` 负责 Leaflet 初始化、地图实例暴露、快照订阅以及底图/视角/图层管理。
4. `BaseMapManager`、`ViewportManager`、`LayerManager`、`ToolRegistry` 在运行时内部协作。
5. 地图助手优先通过后端 AI tools 产出结构化地图动作，再由前端执行；本地关键词分流作为兜底保留。

## 开发约定

- 地图能力统一按 Leaflet 开发，不再维护其他地图引擎兼容层
- 地图助手相关组件与 runtime 统一放在 `src/features/map/assistant`
- 共享 UI 基础组件继续保留在 `src/components/ui`
