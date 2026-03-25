'use client'

import { PencilRuler, Ruler } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { MapRuntimeState } from '@/lib/map/store'

import { getBaseLayerType, toViewportState } from '../bridge/map'
import type { LayerToggleItem, QuickLocation, ShellPanelState, ShellToolbarAction, StatusBarState } from '../types'

const INITIAL_PANELS: ShellPanelState = {
  leftDrawerOpen: true,
  searchOpen: false,
  layerPanelOpen: true,
  aiPanelOpen: false
}

const INITIAL_LAYERS: LayerToggleItem[] = [
  { id: 'bridge-monitor', name: '桥梁监测', visible: true, description: '主桥梁、匝道与控制点' },
  { id: 'slope-monitor', name: '边坡监测', visible: true, description: '滑坡体、位移桩与风险区' },
  { id: 'settlement-monitor', name: '沉降监测', visible: false, description: '路基与站点沉降监测' }
]

const QUICK_LOCATIONS: QuickLocation[] = [
  { id: 'beijing', label: '北京城区', center: { lng: 116.39745, lat: 39.90918 }, zoom: 8.6 },
  { id: 'xian', label: '西安走廊', center: { lng: 108.93977, lat: 34.34157 }, zoom: 7.9 },
  { id: 'yanan', label: '延榆六标', center: { lng: 109.49027, lat: 36.58546 }, zoom: 9.4 }
]

function formatCoordinate(lng: number, lat: number) {
  return `${lat.toFixed(5)}°N ${lng.toFixed(5)}°E`
}

function formatScale(zoom: number) {
  if (zoom >= 10) return '100 公里'
  if (zoom >= 8) return '300 公里'
  if (zoom >= 6) return '1,000 公里'
  if (zoom >= 4) return '3,000 公里'
  return '5,000 公里'
}

export function useMapShellModel(snapshot: MapRuntimeState) {
  const [layers, setLayers] = useState<LayerToggleItem[]>(INITIAL_LAYERS)
  const [panels, setPanels] = useState<ShellPanelState>(INITIAL_PANELS)
  const [activeTool, setActiveTool] = useState<'measure' | 'draw' | null>(null)

  const activeBaseLayer = getBaseLayerType(snapshot.baseMap)
  const viewport = toViewportState(snapshot)

  const visibleLayerCount = useMemo(() => layers.filter((layer) => layer.visible).length, [layers])

  const statusBar = useMemo<StatusBarState>(
    () => ({
      attribution: `OmniSpatial AI · ${activeBaseLayer === 'satellite' ? '影像场景' : activeBaseLayer === 'terrain' ? '地形场景' : '矢量场景'} · 数据归因`,
      scaleLabel: formatScale(viewport.zoom),
      cameraLabel: `相机：${Math.round(viewport.cameraAltitudeKm).toLocaleString('zh-CN')} 公里`,
      coordinateLabel: formatCoordinate(viewport.center.lng, viewport.center.lat),
      zoomLabel: `Z${viewport.zoom.toFixed(1)} · ${viewport.is3D ? '3D' : '2D'}`,
      engineLabel: `引擎：${viewport.activeEngine}`
    }),
    [activeBaseLayer, viewport]
  )

  const toolbarActions = useMemo<ShellToolbarAction[]>(
    () => [
      {
        id: 'measure',
        label: '测量工具',
        shortLabel: '测量',
        icon: Ruler,
        group: 'data',
        active: activeTool === 'measure'
      },
      {
        id: 'draw',
        label: '绘制工具',
        shortLabel: '绘制',
        icon: PencilRuler,
        group: 'data',
        active: activeTool === 'draw'
      }
    ],
    [activeTool]
  )

  return {
    activeBaseLayer,
    activeTool,
    layers,
    panels,
    quickLocations: QUICK_LOCATIONS,
    setActiveTool(tool: 'measure' | 'draw' | null) {
      setActiveTool(tool)
    },
    setPanelState(updater: Partial<ShellPanelState>) {
      setPanels((current) => ({ ...current, ...updater }))
    },
    statusBar,
    toggleLayer(layerId: string) {
      setLayers((current) =>
        current.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer))
      )
    },
    toolbarActions,
    viewport,
    visibleLayerCount
  }
}
