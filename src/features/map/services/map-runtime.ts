'use client'

import { defaultBaseMaps, type BBox, type FeatureQuery, type LayerDescriptor, type MapViewState } from '@/lib/gis/schema'

import type { BaseLayerType, MapCenter, MapTool, MapViewportState } from '../types'
import { BaseMapManager } from './runtime/base-map-manager'
import { LayerManager } from './runtime/layer-manager'
import { ToolRegistry } from './runtime/tool-registry'
import { ViewportManager } from './runtime/viewport-manager'

type LeafletModule = typeof import('leaflet')
type LeafletMap = import('leaflet').Map
type BaseMapValue = ReturnType<typeof defaultBaseMaps>[keyof ReturnType<typeof defaultBaseMaps>]

export interface MapRuntimeState {
  view: MapViewState
  layers: LayerDescriptor[]
  baseMap: BaseMapValue | null
  activeTool: MapTool | null
  lastError: string | null
}

type RuntimeListener = (state: MapRuntimeState) => void

const DEFAULT_BASE_MAPS = defaultBaseMaps()

const BASE_LAYER_MAP = {
  vector: DEFAULT_BASE_MAPS.streets,
  satellite: DEFAULT_BASE_MAPS.imagery,
  terrain: DEFAULT_BASE_MAPS.light
} as const

const INITIAL_VIEW: MapViewState = {
  center: {
    lng: 113.86005,
    lat: 38.75615
  },
  zoom: 2.8,
  pitch: 0,
  bearing: 0
}

export class MapRuntime {
  private readonly listeners = new Set<RuntimeListener>()

  private readonly viewportManager: ViewportManager

  private readonly baseMapManager: BaseMapManager

  private readonly layerManager: LayerManager

  private readonly toolRegistry: ToolRegistry

  private container: HTMLElement | null = null

  private leaflet: LeafletModule | null = null

  private map: LeafletMap | null = null

  private state: MapRuntimeState = {
    view: INITIAL_VIEW,
    layers: [],
    baseMap: BASE_LAYER_MAP.vector,
    activeTool: null,
    lastError: null
  }

  constructor() {
    this.viewportManager = new ViewportManager({
      initialView: INITIAL_VIEW,
      onViewChange: (view) => {
        this.setState({ view })
      }
    })

    this.baseMapManager = new BaseMapManager({
      initialBaseMap: BASE_LAYER_MAP.vector,
      onBaseMapChange: (baseMap) => {
        this.setState({ baseMap })
      }
    })

    this.layerManager = new LayerManager({
      onLayersChange: (layers) => {
        this.setState({ layers })
      }
    })

    this.toolRegistry = new ToolRegistry({
      onActiveToolChange: (activeTool) => {
        this.setState({ activeTool })
      }
    })
  }

  getMap() {
    return this.map
  }

  getSnapshot() {
    return this.state
  }

  subscribe(listener: RuntimeListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  async mount(container: HTMLElement) {
    this.container = container
    this.leaflet = await this.loadLeaflet()

    container.innerHTML = ''
    container.classList.add('leaflet-host')

    this.map = this.leaflet.map(container, {
      attributionControl: false,
      preferCanvas: true,
      worldCopyJump: true,
      zoomControl: false
    })

    this.leaflet.control
      .attribution({
        position: 'bottomleft',
        prefix: false
      })
      .addTo(this.map)

    this.baseMapManager.attach(this.map, this.leaflet)
    this.layerManager.attach(this.map, this.leaflet)
    this.viewportManager.attach(this.map)
    this.toolRegistry.attach(this.map, this.leaflet)

    return () => {
      void this.unmount()
    }
  }

  async unmount() {
    this.toolRegistry.detach()
    this.layerManager.detach()
    this.baseMapManager.detach()
    this.viewportManager.detach()

    this.map?.remove()
    this.map = null

    if (this.container) {
      this.container.innerHTML = ''
      this.container.classList.remove('leaflet-host')
    }

    this.container = null
  }

  getBaseLayerType(baseMap: MapRuntimeState['baseMap']): BaseLayerType {
    if (baseMap?.id === BASE_LAYER_MAP.satellite.id) {
      return 'satellite'
    }

    if (baseMap?.id === BASE_LAYER_MAP.terrain.id) {
      return 'terrain'
    }

    return 'vector'
  }

  toViewportState(state: MapRuntimeState): MapViewportState {
    return {
      center: state.view.center,
      zoom: state.view.zoom,
      pitch: state.view.pitch,
      bearing: state.view.bearing
    }
  }

  setActiveTool(nextTool: MapTool | null) {
    this.toolRegistry.setActiveTool(nextTool)
  }

  async moveTo(view: { center: MapCenter; zoom?: number; pitch?: number; bearing?: number }) {
    await this.runSafely(async () => {
      await this.viewportManager.setView(view)
    })
  }

  async setZoom(zoom: number) {
    await this.runSafely(async () => {
      await this.viewportManager.setView({ zoom })
    })
  }

  async zoomIn() {
    const current = this.state.view.zoom
    const nextZoom = Math.min(12, current + 0.6)
    await this.setZoom(nextZoom)
  }

  async zoomOut() {
    const current = this.state.view.zoom
    const nextZoom = Math.max(1.8, current - 0.6)
    await this.setZoom(nextZoom)
  }

  async locate(center: MapCenter) {
    await this.moveTo({
      center,
      zoom: 8.8
    })
  }

  async resetView() {
    await this.moveTo(INITIAL_VIEW)
    await this.switchBaseLayer('vector')
  }

  async switchBaseLayer(layer: BaseLayerType) {
    await this.runSafely(async () => {
      await this.baseMapManager.setBaseMap(BASE_LAYER_MAP[layer])
    })
  }

  async addLayer(layer: LayerDescriptor) {
    await this.runSafely(async () => {
      await this.layerManager.addLayer(layer)
    })
  }

  async updateLayer(layer: LayerDescriptor) {
    await this.runSafely(async () => {
      await this.layerManager.updateLayer(layer)
    })
  }

  async removeLayer(layerId: string) {
    await this.runSafely(async () => {
      await this.layerManager.removeLayer(layerId)
    })
  }

  async fitBounds(bounds: BBox) {
    await this.runSafely(async () => {
      await this.viewportManager.fitBounds(bounds)
    })
  }

  async highlightFeature(query: FeatureQuery) {
    await this.runSafely(async () => {
      await this.layerManager.highlightFeature(query)
    })
  }

  private async loadLeaflet() {
    return import('leaflet')
  }

  private setState(next: Partial<MapRuntimeState>) {
    this.state = {
      ...this.state,
      ...next
    }

    for (const listener of this.listeners) {
      listener(this.state)
    }
  }

  private async runSafely(task: () => Promise<void>) {
    try {
      await task()
      this.setState({ lastError: null })
    } catch (error) {
      this.setState({
        lastError: error instanceof Error ? error.message : '未知地图错误'
      })
      throw error
    }
  }
}

export const mapRuntime = new MapRuntime()
