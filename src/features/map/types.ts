import type { LucideIcon } from 'lucide-react'
import type { ChatModelId } from '@/features/map/lib/models'
import type { BBox, EngineType, LayerDescriptor } from '@/lib/gis/schema'

export type ModelOptions = ChatModelId

export interface MapCenter {
  lng: number
  lat: number
}

export type BaseLayerType = 'vector' | 'satellite' | 'terrain'

export type MapTool = 'measure' | 'point' | 'geometry'

export interface UserLayerListItem {
  id: string
  name: string
  visible: boolean
  featureCount: number
  sourceType: LayerDescriptor['sourceType']
  geometryType: LayerDescriptor['geometryType']
  bounds: BBox | null
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
