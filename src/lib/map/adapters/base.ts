import {
  type BaseMapDescriptor,
  type BBox,
  type EngineType,
  type FeatureQuery,
  type FitOptions,
  type LayerDescriptor,
  type MapViewState,
  mapViewStateSchema,
  type Unsubscribe
} from '@/lib/gis/schema'
import type { EngineEventMap, EngineInitOptions, IMapEngine } from '@/lib/map/engines'
import { MapEngineError } from '@/lib/map/errors'

type EventListeners = {
  [K in keyof EngineEventMap]: Set<(payload: EngineEventMap[K]) => void>
}

const defaultView = mapViewStateSchema.parse({})

export abstract class BaseDomMapEngine implements IMapEngine {
  readonly type: EngineType

  protected container: HTMLElement | null = null

  protected view: MapViewState = defaultView

  protected layers = new Map<string, LayerDescriptor>()

  protected baseMap: BaseMapDescriptor | null = null

  private listeners: EventListeners = {
    viewChange: new Set(),
    click: new Set(),
    layerChange: new Set()
  }

  protected constructor(type: EngineType) {
    this.type = type
  }

  async mount(container: HTMLElement, options?: EngineInitOptions): Promise<void> {
    this.container = container
    this.view = {
      ...defaultView,
      ...options?.initialView
    }
    this.baseMap = options?.baseMap ?? null
    this.render()
  }

  async unmount(): Promise<void> {
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.container = null
  }

  async setView(state: Partial<MapViewState>): Promise<void> {
    this.view = {
      ...this.view,
      ...state
    }
    this.emit('viewChange', this.view)
    this.render()
  }

  getView(): MapViewState {
    return this.view
  }

  async addLayer(layer: LayerDescriptor): Promise<void> {
    this.layers.set(layer.id, layer)
    this.emit('layerChange', { layers: [...this.layers.values()] })
    this.render()
  }

  async updateLayer(layer: LayerDescriptor): Promise<void> {
    if (!this.layers.has(layer.id)) {
      throw new MapEngineError(`图层不存在: ${layer.id}`, 'LAYER_NOT_FOUND')
    }
    this.layers.set(layer.id, layer)
    this.emit('layerChange', { layers: [...this.layers.values()] })
    this.render()
  }

  async removeLayer(layerId: string): Promise<void> {
    this.layers.delete(layerId)
    this.emit('layerChange', { layers: [...this.layers.values()] })
    this.render()
  }

  async setBaseMap(baseMap: BaseMapDescriptor): Promise<void> {
    this.baseMap = baseMap
    this.render()
  }

  async highlightFeature(query: FeatureQuery): Promise<void> {
    this.render(`高亮查询: ${query.layerId}`)
  }

  async fitBounds(bounds: BBox, _options?: FitOptions): Promise<void> {
    const [minLng, minLat, maxLng, maxLat] = bounds
    await this.setView({
      center: {
        lng: (minLng + maxLng) / 2,
        lat: (minLat + maxLat) / 2
      },
      bounds
    })
  }

  on<K extends keyof EngineEventMap>(event: K, handler: (payload: EngineEventMap[K]) => void): Unsubscribe {
    const bucket = this.listeners[event] as Set<(payload: EngineEventMap[K]) => void>
    bucket.add(handler)
    return () => bucket.delete(handler)
  }

  protected emit<K extends keyof EngineEventMap>(event: K, payload: EngineEventMap[K]) {
    const bucket = this.listeners[event] as Set<(payload: EngineEventMap[K]) => void>
    bucket.forEach((handler) => handler(payload))
  }

  protected render(overlayMessage?: string) {
    if (!this.container) {
      return
    }

    const layerNames = [...this.layers.values()].map((layer) => `${layer.name} (${layer.geometryType})`).join(' / ')

    this.container.innerHTML = `
      <div style="height:100%;width:100%;display:flex;flex-direction:column;justify-content:space-between;padding:20px;border-radius:24px;background:${this.getBackground()};color:white;font-family:ui-sans-serif,system-ui,sans-serif;">
        <div>
          <div style="font-size:12px;opacity:.7;letter-spacing:.12em;text-transform:uppercase;">${this.type} engine adapter</div>
          <div style="margin-top:8px;font-size:24px;font-weight:700;">${this.getTitle()}</div>
          <div style="margin-top:12px;font-size:14px;opacity:.85;">底图：${this.baseMap?.name ?? '未设置'}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
          <div style="padding:12px;border-radius:16px;background:rgba(255,255,255,.08)">
            <div style="font-size:12px;opacity:.7;">中心点</div>
            <div style="margin-top:6px;font-size:16px;font-weight:600;">${this.view.center.lng.toFixed(4)}, ${this.view.center.lat.toFixed(4)}</div>
          </div>
          <div style="padding:12px;border-radius:16px;background:rgba(255,255,255,.08)">
            <div style="font-size:12px;opacity:.7;">缩放 / 倾角</div>
            <div style="margin-top:6px;font-size:16px;font-weight:600;">${this.view.zoom.toFixed(2)} / ${this.view.pitch.toFixed(0)}</div>
          </div>
          <div style="grid-column:1 / span 2;padding:12px;border-radius:16px;background:rgba(255,255,255,.08)">
            <div style="font-size:12px;opacity:.7;">图层</div>
            <div style="margin-top:6px;font-size:15px;font-weight:600;">${layerNames || '暂无图层'}</div>
          </div>
        </div>
        <div style="font-size:13px;opacity:.82;">${overlayMessage ?? '当前为演示适配层，真实 SDK 可按同一接口替换接入。'}</div>
      </div>
    `
  }

  protected abstract getBackground(): string

  protected abstract getTitle(): string
}
