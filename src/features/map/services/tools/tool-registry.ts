import type { LayerDescriptor } from '@/lib/gis/schema'

import type { MapTool } from '../../types'
import { DrawToolController } from './draw-controller'
import { MeasureToolController } from './measure-controller'

type LeafletModule = typeof import('leaflet')
type LeafletMap = import('leaflet').Map

export interface MapToolController {
  attach(map: LeafletMap, leaflet: LeafletModule): void
  activate(tool: MapTool): void
  deactivate(): void
  destroy(): void
  syncLayers(layers: LayerDescriptor[]): void
}

interface ToolRegistryOptions {
  onActiveToolChange: (tool: MapTool | null) => void
  onAddLayer: (layer: LayerDescriptor) => Promise<void> | void
  onRemoveLayer: (layerId: string) => Promise<void> | void
  onRequestToolChange: (tool: MapTool | null) => void
  onUpdateLayer: (layer: LayerDescriptor) => Promise<void> | void
}

export class ToolRegistry {
  private readonly drawToolController: DrawToolController

  private readonly measureToolController: MeasureToolController

  private readonly tools: Record<MapTool, MapToolController>

  private activeTool: MapTool | null = null

  private readonly onActiveToolChange: ToolRegistryOptions['onActiveToolChange']

  constructor(options: ToolRegistryOptions) {
    this.onActiveToolChange = options.onActiveToolChange
    this.drawToolController = new DrawToolController({
      onAddLayer: options.onAddLayer,
      onRemoveLayer: options.onRemoveLayer,
      onRequestToolChange: options.onRequestToolChange,
      onUpdateLayer: options.onUpdateLayer
    })
    this.measureToolController = new MeasureToolController({
      onAddLayer: options.onAddLayer,
      onRemoveLayer: options.onRemoveLayer,
      onRequestToolChange: options.onRequestToolChange,
      onUpdateLayer: options.onUpdateLayer
    })
    this.tools = {
      geometry: this.drawToolController,
      measure: this.measureToolController,
      point: this.drawToolController
    }
  }

  attach(map: LeafletMap, leaflet: LeafletModule) {
    for (const tool of this.uniqueControllers()) {
      tool.attach(map, leaflet)
    }
  }

  detach() {
    for (const tool of this.uniqueControllers()) {
      tool.deactivate()
      tool.destroy()
    }
  }

  getActiveTool() {
    return this.activeTool
  }

  syncLayers(layers: LayerDescriptor[]) {
    for (const tool of this.uniqueControllers()) {
      tool.syncLayers(layers)
    }
  }

  setActiveTool(nextTool: MapTool | null) {
    if (this.activeTool) {
      this.tools[this.activeTool].deactivate()
    }

    this.activeTool = nextTool

    if (this.activeTool) {
      this.tools[this.activeTool].activate(this.activeTool)
    }

    this.onActiveToolChange(this.activeTool)
  }

  private uniqueControllers() {
    return [...new Set(Object.values(this.tools))]
  }
}
