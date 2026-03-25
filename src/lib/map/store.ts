import type { BaseMapDescriptor, EngineType, LayerDescriptor, MapViewState, Unsubscribe } from '@/lib/gis/schema'

export interface MapRuntimeState {
  activeEngine: EngineType
  view: MapViewState
  layers: LayerDescriptor[]
  baseMap: BaseMapDescriptor | null
  lastError: string | null
}

type Listener = (state: MapRuntimeState) => void

export class MapRuntimeStore {
  private state: MapRuntimeState

  private listeners = new Set<Listener>()

  constructor(initialState: MapRuntimeState) {
    this.state = initialState
  }

  getState(): MapRuntimeState {
    return this.state
  }

  setState(next: Partial<MapRuntimeState>) {
    this.state = {
      ...this.state,
      ...next
    }
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: Listener): Unsubscribe {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}
