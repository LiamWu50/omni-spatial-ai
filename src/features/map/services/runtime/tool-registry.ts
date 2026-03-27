import type { MapTool } from '../../types'

type LeafletModule = typeof import('leaflet')
type LeafletMap = import('leaflet').Map

export interface MapToolController {
  attach(map: LeafletMap, leaflet: LeafletModule): void
  activate(): void
  deactivate(): void
  destroy(): void
}

interface ToolRegistryOptions {
  onActiveToolChange: (tool: MapTool | null) => void
}

class NoopToolController implements MapToolController {
  attach(_map: LeafletMap, _leaflet: LeafletModule) {}

  activate() {}

  deactivate() {}

  destroy() {}
}

export class ToolRegistry {
  private readonly tools: Record<MapTool, MapToolController> = {
    geometry: new NoopToolController(),
    measure: new NoopToolController(),
    point: new NoopToolController()
  }

  private activeTool: MapTool | null = null

  private map: LeafletMap | null = null

  private leaflet: LeafletModule | null = null

  private readonly onActiveToolChange: ToolRegistryOptions['onActiveToolChange']

  constructor(options: ToolRegistryOptions) {
    this.onActiveToolChange = options.onActiveToolChange
  }

  attach(map: LeafletMap, leaflet: LeafletModule) {
    this.map = map
    this.leaflet = leaflet

    for (const tool of Object.values(this.tools)) {
      tool.attach(map, leaflet)
    }
  }

  detach() {
    for (const tool of Object.values(this.tools)) {
      tool.deactivate()
      tool.destroy()
    }

    this.map = null
    this.leaflet = null
  }

  getActiveTool() {
    return this.activeTool
  }

  setActiveTool(nextTool: MapTool | null) {
    if (this.activeTool) {
      this.tools[this.activeTool].deactivate()
    }

    this.activeTool = nextTool

    if (this.activeTool) {
      this.tools[this.activeTool].activate()
    }

    this.onActiveToolChange(this.activeTool)
  }
}
