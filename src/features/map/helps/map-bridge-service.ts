'use client'

import {
  type BBox,
  createActionMeta,
  defaultBaseMaps,
  type EngineType,
  type LayerDescriptor,
  type MapViewState
} from '@/lib/gis/schema'
import { CesiumAdapter } from '@/lib/map/adapters/cesium'
import { LeafletAdapter } from '@/lib/map/adapters/leaflet'
import { MapboxAdapter } from '@/lib/map/adapters/mapbox'
import { MapController } from '@/lib/map/controller'
import { actionBus } from '@/lib/map/event-bus'
import type { MapRuntimeState } from '@/lib/map/store'

import type { BaseLayerType, MapCenter, MapViewportState } from '../types'

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
  bearing: 0,
  altitude: 24490
}

export class MapBridgeService {
  private readonly controller = new MapController({
    engines: {
      mapbox: new MapboxAdapter(),
      cesium: new CesiumAdapter(),
      leaflet: new LeafletAdapter()
    },
    initialEngine: 'leaflet',
    initialView: INITIAL_VIEW,
    initialBaseMap: BASE_LAYER_MAP.vector
  })

  private runtimeSnapshot = this.controller.store.getState()
  private readonly runtimeListeners = new Set<() => void>()

  constructor() {
    this.controller.store.subscribe((state) => {
      this.runtimeSnapshot = state
      this.runtimeListeners.forEach((listener) => listener())
    })
  }

  getSnapshot() {
    return this.runtimeSnapshot
  }

  subscribe(listener: () => void) {
    this.runtimeListeners.add(listener)
    return () => this.runtimeListeners.delete(listener)
  }

  mount(container: HTMLElement) {
    void this.controller.mount(container)

    const unsubscribe = actionBus.subscribe(async (action) => {
      await this.controller.dispatch(action)
    })

    return () => {
      unsubscribe()
      void this.controller.unmount()
    }
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
    const altitude = state.view.altitude ?? this.nextAltitude(state.view.zoom)

    return {
      activeEngine: state.activeEngine,
      center: state.view.center,
      zoom: state.view.zoom,
      pitch: state.view.pitch,
      bearing: state.view.bearing,
      is3D: state.activeEngine === 'cesium',
      cameraAltitudeKm: altitude
    }
  }

  async moveTo(view: { center: MapCenter; zoom?: number; pitch?: number; bearing?: number; altitude?: number }) {
    await this.controller.dispatch({
      type: 'MOVE_TO',
      payload: view,
      meta: createActionMeta('ui')
    })
  }

  async setZoom(zoom: number) {
    await this.controller.dispatch({
      type: 'SET_ZOOM',
      payload: { zoom },
      meta: createActionMeta('ui')
    })
  }

  async zoomIn() {
    const current = this.runtimeSnapshot.view.zoom
    const nextZoom = Math.min(12, current + 0.6)

    await this.moveTo({
      center: this.runtimeSnapshot.view.center,
      zoom: nextZoom,
      pitch: this.runtimeSnapshot.view.pitch,
      bearing: this.runtimeSnapshot.view.bearing,
      altitude: this.nextAltitude(nextZoom)
    })
  }

  async zoomOut() {
    const current = this.runtimeSnapshot.view.zoom
    const nextZoom = Math.max(1.8, current - 0.6)

    await this.moveTo({
      center: this.runtimeSnapshot.view.center,
      zoom: nextZoom,
      pitch: this.runtimeSnapshot.view.pitch,
      bearing: this.runtimeSnapshot.view.bearing,
      altitude: this.nextAltitude(nextZoom)
    })
  }

  async locate(center: MapCenter) {
    await this.moveTo({
      center,
      zoom: 8.8,
      pitch: 32,
      bearing: 0,
      altitude: 3200
    })
  }

  async resetView() {
    await this.moveTo(INITIAL_VIEW)
    await this.switchBaseLayer('vector')
  }

  async resetOrientation() {
    const viewport = this.toViewportState(this.runtimeSnapshot)

    await this.moveTo({
      center: this.runtimeSnapshot.view.center,
      zoom: this.runtimeSnapshot.view.zoom,
      pitch: viewport.is3D ? 45 : 0,
      bearing: 0,
      altitude: this.runtimeSnapshot.view.altitude ?? this.nextAltitude(this.runtimeSnapshot.view.zoom)
    })
  }

  async switchBaseLayer(layer: BaseLayerType) {
    await this.controller.dispatch({
      type: 'SWITCH_BASEMAP',
      payload: {
        baseMap: BASE_LAYER_MAP[layer]
      },
      meta: createActionMeta('ui')
    })
  }

  async addLayer(layer: LayerDescriptor) {
    await this.controller.dispatch({
      type: 'ADD_LAYER',
      payload: {
        layer
      },
      meta: createActionMeta('ui')
    })
  }

  async updateLayer(layer: LayerDescriptor) {
    await this.controller.dispatch({
      type: 'UPDATE_LAYER',
      payload: {
        layer
      },
      meta: createActionMeta('ui')
    })
  }

  async removeLayer(layerId: string) {
    await this.controller.dispatch({
      type: 'REMOVE_LAYER',
      payload: {
        layerId
      },
      meta: createActionMeta('ui')
    })
  }

  async fitBounds(bounds: BBox) {
    await this.controller.dispatch({
      type: 'FIT_BOUNDS',
      payload: {
        bounds
      },
      meta: createActionMeta('ui')
    })
  }

  switchEngine(engine: EngineType) {
    return this.controller.switchEngine(engine)
  }

  private nextAltitude(zoom: number) {
    return Math.max(900, Math.round(28000 - zoom * 2400))
  }
}

export const mapBridge = new MapBridgeService()

export type MapBridge = typeof mapBridge
