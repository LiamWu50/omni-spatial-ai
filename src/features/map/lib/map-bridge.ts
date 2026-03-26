'use client'

import { createActionMeta, defaultBaseMaps, type EngineType, type MapViewState } from '@/lib/gis/schema'
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

const controller = new MapController({
  engines: {
    mapbox: new MapboxAdapter(),
    cesium: new CesiumAdapter(),
    leaflet: new LeafletAdapter()
  },
  initialEngine: 'leaflet',
  initialView: INITIAL_VIEW,
  initialBaseMap: BASE_LAYER_MAP.vector
})

let runtimeSnapshot = controller.store.getState()
const runtimeListeners = new Set<() => void>()

controller.store.subscribe((state) => {
  runtimeSnapshot = state
  runtimeListeners.forEach((listener) => listener())
})

function nextAltitude(zoom: number) {
  return Math.max(900, Math.round(28000 - zoom * 2400))
}

export function getBaseLayerType(baseMap: MapRuntimeState['baseMap']): BaseLayerType {
  if (baseMap?.id === BASE_LAYER_MAP.satellite.id) {
    return 'satellite'
  }

  if (baseMap?.id === BASE_LAYER_MAP.terrain.id) {
    return 'terrain'
  }

  return 'vector'
}

export function toViewportState(state: MapRuntimeState): MapViewportState {
  const altitude = state.view.altitude ?? nextAltitude(state.view.zoom)

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

export const mapBridge = {
  getSnapshot() {
    return runtimeSnapshot
  },
  subscribe(listener: () => void) {
    runtimeListeners.add(listener)
    return () => runtimeListeners.delete(listener)
  },
  mount(container: HTMLElement) {
    void controller.mount(container)

    const unsubscribe = actionBus.subscribe(async (action) => {
      await controller.dispatch(action)
    })

    return () => {
      unsubscribe()
      void controller.unmount()
    }
  },
  async moveTo(view: { center: MapCenter; zoom?: number; pitch?: number; bearing?: number; altitude?: number }) {
    await controller.dispatch({
      type: 'MOVE_TO',
      payload: view,
      meta: createActionMeta('ui')
    })
  },
  async setZoom(zoom: number) {
    await controller.dispatch({
      type: 'SET_ZOOM',
      payload: { zoom },
      meta: createActionMeta('ui')
    })
  },
  async zoomIn() {
    const current = runtimeSnapshot.view.zoom
    const nextZoom = Math.min(12, current + 0.6)

    await this.moveTo({
      center: runtimeSnapshot.view.center,
      zoom: nextZoom,
      pitch: runtimeSnapshot.view.pitch,
      bearing: runtimeSnapshot.view.bearing,
      altitude: nextAltitude(nextZoom)
    })
  },
  async zoomOut() {
    const current = runtimeSnapshot.view.zoom
    const nextZoom = Math.max(1.8, current - 0.6)

    await this.moveTo({
      center: runtimeSnapshot.view.center,
      zoom: nextZoom,
      pitch: runtimeSnapshot.view.pitch,
      bearing: runtimeSnapshot.view.bearing,
      altitude: nextAltitude(nextZoom)
    })
  },
  async locate(center: MapCenter) {
    await this.moveTo({
      center,
      zoom: 8.8,
      pitch: 32,
      bearing: 0,
      altitude: 3200
    })
  },
  async resetView() {
    await this.moveTo(INITIAL_VIEW)
    await this.switchBaseLayer('vector')
  },
  async resetOrientation() {
    const viewport = toViewportState(runtimeSnapshot)

    await this.moveTo({
      center: runtimeSnapshot.view.center,
      zoom: runtimeSnapshot.view.zoom,
      pitch: viewport.is3D ? 45 : 0,
      bearing: 0,
      altitude: runtimeSnapshot.view.altitude ?? nextAltitude(runtimeSnapshot.view.zoom)
    })
  },
  async switchBaseLayer(layer: BaseLayerType) {
    await controller.dispatch({
      type: 'SWITCH_BASEMAP',
      payload: {
        baseMap: BASE_LAYER_MAP[layer]
      },
      meta: createActionMeta('ui')
    })
  },
  switchEngine(engine: EngineType) {
    return controller.switchEngine(engine)
  }
}

export type MapBridge = typeof mapBridge
