import type { LucideIcon } from 'lucide-react'

import type { BBox, LayerDescriptor } from '@/lib/gis/schema'

export interface MapCenter {
  lng: number
  lat: number
}

export type BaseLayerType = 'dark' | 'light'

export type MapTool = 'measure' | 'point' | 'geometry'

export type LayerOrigin = 'upload' | 'measure' | 'draw'

export interface UserLayerListItem {
  id: string
  name: string
  visible: boolean
  featureCount: number
  sourceType: LayerDescriptor['sourceType']
  geometryType: LayerDescriptor['geometryType']
  bounds: BBox | null
  origin: LayerOrigin
}

export interface BaseMapOption {
  key: BaseLayerType
  label: string
  previewClassName: string
}

export interface MapViewportState {
  center: MapCenter
  zoom: number
  pitch: number
  bearing: number
}

export interface ShellPanelState {
  layerManagerOpen: boolean
  assistantPanelOpen: boolean
}

export interface ShellToolbarAction {
  id: MapTool
  label: string
  shortLabel: string
  icon: LucideIcon
  group: 'data'
  active?: boolean
}

export interface StatusBarState {
  attribution: string
  scaleLabel: string
  coordinateLabel: string
  zoomLabel: string
}
