'use client'

import { useMemo, useState } from 'react'

import type { MapRuntimeState } from '@/lib/map/store'

import { INITIAL_LAYER_ITEMS, INITIAL_PANEL_STATE, QUICK_LOCATIONS, TOOLBAR_ACTIONS } from '../lib/constants'
import { formatAttribution, formatCoordinate, formatScale } from '../lib/formatters'
import { getBaseLayerType, toViewportState } from '../lib/map-bridge'
import type { LayerToggleItem, MapTool, ShellPanelState, ShellToolbarAction, StatusBarState } from '../types'

export function useMapShell(snapshot: MapRuntimeState) {
  const [layers, setLayers] = useState<LayerToggleItem[]>(INITIAL_LAYER_ITEMS)
  const [panels, setPanels] = useState<ShellPanelState>(INITIAL_PANEL_STATE)
  const [activeTool, setActiveTool] = useState<MapTool | null>(null)

  const activeBaseLayer = getBaseLayerType(snapshot.baseMap)
  const viewport = toViewportState(snapshot)

  const visibleLayerCount = useMemo(() => layers.filter((layer) => layer.visible).length, [layers])

  const statusBar = useMemo<StatusBarState>(
    () => ({
      attribution: formatAttribution(activeBaseLayer),
      scaleLabel: formatScale(viewport.zoom),
      cameraLabel: `相机：${Math.round(viewport.cameraAltitudeKm).toLocaleString('zh-CN')} 公里`,
      coordinateLabel: formatCoordinate(viewport.center.lng, viewport.center.lat),
      zoomLabel: `Z${viewport.zoom.toFixed(1)} · ${viewport.is3D ? '3D' : '2D'}`,
      engineLabel: `引擎：${viewport.activeEngine}`
    }),
    [activeBaseLayer, viewport]
  )

  const toolbarActions = useMemo<ShellToolbarAction[]>(
    () =>
      TOOLBAR_ACTIONS.map((action) => ({
        ...action,
        active: activeTool === action.id
      })),
    [activeTool]
  )

  return {
    activeBaseLayer,
    activeTool,
    layers,
    panels,
    quickLocations: QUICK_LOCATIONS,
    setActiveTool,
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
