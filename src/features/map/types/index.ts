import type { LucideIcon } from 'lucide-react'

import type { EngineType } from '@/lib/gis/schema'

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

export interface QuickLocation {
  id: string
  label: string
  center: MapCenter
  zoom: number
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
  leftDrawerOpen: boolean
  searchOpen: boolean
  layerPanelOpen: boolean
  aiPanelOpen: boolean
}

export interface ShellToolbarAction {
  id: string
  label: string
  shortLabel: string
  icon: LucideIcon
  group: 'history' | 'mode' | 'data' | 'system'
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
