# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Omni-Spatial AI is an AI-powered geospatial intelligence platform that combines a Leaflet.js-based map interface with a Large Language Model (Qwen via Dashscope). Users interact with the map through natural language commands like "fly to Beijing" or "load this GeoJSON data".

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Code quality
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
pnpm check         # ESLint + Prettier check
pnpm typecheck     # TypeScript type checking

# Testing
pnpm test          # Run Node.js test runner with tsx
```

## Architecture Overview

### AI-Map Integration Flow

The core innovation is the bidirectional AI-map integration:

1. **Frontend**: User sends a natural language message via `@assistant-ui/react` components
2. **API Route**: `/api/chat` receives messages and streams them to the AI model
3. **Tool Execution**: AI can call tools (defined in `src/server/chat/tools/`)
4. **Client Actions**: Tools return `clientActions` (not direct map mutations)
5. **Execution**: `useAssistantRuntime` hook receives actions via streaming and executes them through `MapRuntime`

This pattern ensures AI decisions are validated server-side while map mutations happen client-side.

### Core Services

**MapRuntime** (`src/features/map/services/map-runtime.ts`)

- Central map abstraction managing Leaflet instance
- Exposes methods: `moveTo()`, `addLayer()`, `fitBounds()`, `switchBaseLayer()`, etc.
- Uses sub-managers: `LayerManager`, `BaseMapManager`, `ViewportManager`, `ToolRegistry`
- Accessible via `useMapContext()` hook throughout the component tree

**Client Action System** (`src/features/assistant/lib/`)

- `contracts.ts`: Zod schemas defining `MapClientAction` types (view.fly_to, layer.add, layer.update_style, etc.)
- `client-action-executor.ts`: Executes actions against MapRuntime
- Server tools return `clientActions` arrays; client executor translates to MapRuntime calls

**AI Tools** (`src/server/chat/tools/`)

- `map_view_control`: Fly to coordinates/places, reset view, locate user
- `map_layer_load`: Load GeoJSON from URL, system dataset, or raw data
- `map_layer_style`: Update layer colors, opacity, visibility
- Tools receive geocoder/dataset loader via DI for testability

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/page.tsx      # Main map page
│   ├── (auth)/             # Auth routes (placeholder)
│   └── api/chat/route.ts   # AI chat API endpoint
├── features/               # Domain-driven modules
│   ├── assistant/          # AI assistant UI and runtime
│   │   ├── components/     # Chat UI components
│   │   ├── hooks/          # useAssistantRuntime
│   │   └── lib/            # contracts, action executor
│   └── map/                # Map functionality
│       ├── components/     # Map UI, toolbars, layer manager
│       ├── hooks/          # useMapRuntime, useMapContext
│       ├── services/       # MapRuntime, LayerManager, etc.
│       └── lib/            # Constants, formatters, models
├── server/chat/            # Server-side AI logic
│   ├── tools/              # AI tool definitions
│   ├── stream.ts           # Chat streaming implementation
│   └── prompts.ts          # System prompt
└── lib/gis/                # GIS utilities and schemas
```

### Key Technical Details

**Environment Variables**

- `DASHSCOPE_API_KEY` (required): For AI chat functionality
- `MAP_GEOCODER_CONFIG` (optional): Custom geocoding service JSON config
- `LOCATIONIQ_API_KEY` (optional): Fallback geocoding service

**Map State Management**

- MapRuntime uses pub/sub pattern (not React state) for performance
- Components subscribe via `useMapRuntime()` hook
- Leaflet is loaded dynamically via `import('leaflet')` to avoid SSR issues

**AI Model**

- Default: `qwen-max-latest` (configurable via `model` param in chat request)
- Uses Vercel AI SDK with `@ai-sdk/openai` adapter pointing to Dashscope
- Implements Chinese word-based streaming via `Intl.Segmenter`

**Adding New AI Capabilities**

1. Define tool in `src/server/chat/tools/` with Zod schema
2. Export from `src/server/chat/tools/index.ts`
3. Return `clientActions` from tool execution
4. Add action handler in `client-action-executor.ts` if new action type
5. Update `contracts.ts` schemas for type safety

## Code Style

- Single quotes, no semicolons (Prettier configured)
- Import sorting enforced via `simple-import-sort` ESLint plugin
- Tailwind CSS v4 with shadcn/ui components
- Path alias: `@/*` maps to `src/*`
