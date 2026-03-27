# OmniSpatial AI

OmniSpatial AI 是一个基于 Next.js 16、TypeScript、Leaflet 与 assistant-ui 构建的空间智能工作台 MVP。

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
- assistant-ui 地图助手 runtime：`src/features/map/assistant/runtime/use-map-assistant-runtime.ts`
- GeoJSON / JSON 图层上传、图层管理、底图切换

## 环境变量

| 变量 | 说明 |
|---|---|
| `APP_URL` | 本地访问地址，默认 `http://localhost:3000` |

## 架构概览

1. `src/app/(app)/page.tsx` 作为根路由入口渲染地图工作台。
2. `MapShell` 负责页面装配、图层管理、助手面板与地图挂载。
3. `MapRuntime` 负责 Leaflet 初始化、地图实例暴露、快照订阅以及底图/视角/图层管理。
4. `BaseMapManager`、`ViewportManager`、`LayerManager`、`ToolRegistry` 在运行时内部协作。
5. assistant-ui runtime 在地图 feature 内就地消费当前视口、底图与面板状态。

## 开发约定

- 地图能力统一按 Leaflet 开发，不再维护其他地图引擎兼容层
- 地图助手相关组件与 runtime 统一放在 `src/features/map/assistant`
- 共享 UI 基础组件继续保留在 `src/components/ui`
