import type { LucideIcon } from 'lucide-react'
import type { ChatModelId } from '@/features/map/lib/models'
import type { EngineType } from '@/lib/gis/schema'

export type ModelOptions = ChatModelId

export interface MapCenter {
  lng: number
  lat: number
}

export interface LayerToggleItem {
  id: string
  name: string
  visible: boolean
  description?: string
}

export type BaseLayerType = 'vector' | 'satellite' | 'terrain'

export type MapTool = 'measure' | 'point' | 'geometry'

export interface QuickLocation {
  id: string
  label: string
  center: MapCenter
  zoom: number
}

export interface BaseMapOption {
  key: BaseLayerType
  label: string
  previewClassName: string
}

export interface MapViewportState {
  activeEngine: EngineType
  center: MapCenter
  zoom: number
  pitch: number
  bearing: number
  is3D: boolean
  cameraAltitudeKm: number
}

export interface ShellPanelState {
  layerManagerOpen: boolean
  searchOpen: boolean
  layerListOpen: boolean
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
  cameraLabel: string
  coordinateLabel: string
  zoomLabel: string
  engineLabel: string
}
