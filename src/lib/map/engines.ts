import type {
  BaseMapDescriptor,
  BBox,
  EngineType,
  FeatureQuery,
  FitOptions,
  LayerDescriptor,
  MapViewState,
  Unsubscribe
} from '@/lib/gis/schema'

export interface EngineInitOptions {
  initialView?: Partial<MapViewState>
  baseMap?: BaseMapDescriptor
}

export type EngineEventMap = {
  viewChange: MapViewState
  click: { lng: number; lat: number }
  layerChange: { layers: LayerDescriptor[] }
}

export interface IMapEngine {
  readonly type: EngineType
  mount(container: HTMLElement, options?: EngineInitOptions): Promise<void>
  unmount(): Promise<void>
  setView(state: Partial<MapViewState>): Promise<void>
  getView(): MapViewState
  addLayer(layer: LayerDescriptor): Promise<void>
  updateLayer(layer: LayerDescriptor): Promise<void>
  removeLayer(layerId: string): Promise<void>
  setBaseMap(baseMap: BaseMapDescriptor): Promise<void>
  highlightFeature(query: FeatureQuery): Promise<void>
  fitBounds(bounds: BBox, options?: FitOptions): Promise<void>
  exportSnapshot?(options?: { mimeType?: string }): Promise<Blob>
  on<K extends keyof EngineEventMap>(event: K, handler: (payload: EngineEventMap[K]) => void): Unsubscribe
}
