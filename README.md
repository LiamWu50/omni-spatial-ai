# OmniSpatial AI

OmniSpatial AI 是一个基于 Next.js 16、TypeScript 与统一地图指令协议构建的空间智能操作系统 MVP。当前仓库实现了三部分核心能力：

- `GisAction` + `IMapEngine` + `MapController` 的引擎无关骨架
- `Server Action -> AI 编排 -> ActionBus -> 前端地图实例` 的控制链路
- GeoJSON / Excel 导入与缓冲区分析的最小闭环

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

## 当前已实现

- 三引擎适配骨架：`MapboxAdapter`、`CesiumAdapter`、`LeafletAdapter`
- 统一地图控制器：`/Users/admin/Desktop/omni-spatial-ai/src/lib/map/controller.ts`
- AI 调度入口：`/Users/admin/Desktop/omni-spatial-ai/src/app/actions/chat.ts`
- 空间分析入口：`/Users/admin/Desktop/omni-spatial-ai/src/lib/analysis/service.ts`
- 文件导入组件：`/Users/admin/Desktop/omni-spatial-ai/src/components/file-importer.tsx`

## 环境变量

| 变量 | 说明 |
|---|---|
| `OPENAI_API_KEY` | OpenAI 模型调用 |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox 地图能力 |
| `NEXT_PUBLIC_TIANDITU_TOKEN` | 天地图合规底图 |
| `DATABASE_URL` | PostgreSQL / PostGIS 连接 |
| `DUCKDB_PATH` | DuckDB-Spatial 数据文件路径 |
| `PYTHON_ANALYSIS_URL` | Python 重型分析服务入口 |

## 架构概览

1. 用户在左侧 AI 调度台输入自然语言。
2. `submitSpatialPrompt` Server Action 调用 `runSpatialAssistant`。
3. AI 结果被规范化为 `GisAction[]`。
4. 前端通过 `ActionBus` 将动作发送给 `MapController.dispatch()`。
5. `MapController` 依据当前活动引擎调用对应 Adapter。
6. 图层、视角、底图状态回写到统一 runtime store。

## 后续接真实 SDK 的位置

- 把 `BaseDomMapEngine` 替换为真实 Mapbox GL / Cesium / Leaflet SDK 封装
- 将 `runSpatialAssistant` 中的 mock 意图扩展为完整 Vercel AI SDK 流式编排
- 将 `runAnalysis` 中的本地 buffer 扩展到 DuckDB / PostGIS / Python 服务
# omni-spatial-ai
