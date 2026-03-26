'use client'

import { useCallback } from 'react'

import type { MapBridge } from '../helps/map-bridge-service'
import type { BaseLayerType, MapTool, MapViewportState, QuickLocation, ShellPanelState } from '../types'

interface UseMapShellActionsOptions {
  bridge: MapBridge
  activeTool: MapTool | null
  panels: ShellPanelState
  quickLocations: QuickLocation[]
  setActiveTool: (tool: MapTool | null) => void
  setPanelState: (updater: Partial<ShellPanelState>) => void
  viewport: MapViewportState
}

export function useMapShellActions({
  bridge,
  activeTool,
  panels,
  quickLocations,
  setActiveTool,
  setPanelState,
  viewport
}: UseMapShellActionsOptions) {
  const handleLocate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      void bridge.locate({
        lng: Number(position.coords.longitude.toFixed(5)),
        lat: Number(position.coords.latitude.toFixed(5))
      })
    })
  }, [bridge])

  const handleResetView = useCallback(() => {
    void bridge.resetView()
  }, [bridge])

  const handleOpenQuickLocation = useCallback(
    (locationId: string) => {
      const target = quickLocations.find((location) => location.id === locationId)

      if (!target) {
        return
      }

      void bridge.moveTo({
        center: target.center,
        zoom: target.zoom,
        pitch: 48,
        bearing: 12,
        altitude: Math.max(1800, 26000 - target.zoom * 2000)
      })
    },
    [bridge, quickLocations]
  )

  const handleToggle3D = useCallback(() => {
    const nextEngine = viewport.is3D ? 'mapbox' : 'cesium'
    void bridge.switchEngine(nextEngine)
  }, [bridge, viewport.is3D])

  const handleToolbarAction = useCallback(
    (actionId: string) => {
      const nextTool = actionId === activeTool ? null : (actionId as MapTool)
      setActiveTool(nextTool)
    },
    [activeTool, setActiveTool]
  )

  const handleSwitchBaseLayer = useCallback(
    (layer: BaseLayerType) => {
      void bridge.switchBaseLayer(layer)
    },
    [bridge]
  )

  const handleToggleLayerManager = useCallback(() => {
    setPanelState({ layerManagerOpen: !panels.layerManagerOpen })
  }, [panels.layerManagerOpen, setPanelState])

  const handleToggleLayerList = useCallback(() => {
    setPanelState({
      layerManagerOpen: true,
      layerListOpen: !panels.layerListOpen
    })
  }, [panels.layerListOpen, setPanelState])

  const handleToggleSearch = useCallback(() => {
    setPanelState({
      searchOpen: !panels.searchOpen,
      layerManagerOpen: true
    })
  }, [panels.searchOpen, setPanelState])

  const handleOpenAssistantPanel = useCallback(() => {
    setPanelState({ assistantPanelOpen: true })
  }, [setPanelState])

  const handleAssistantPanelChange = useCallback(
    (open: boolean) => {
      setPanelState({ assistantPanelOpen: open })
    },
    [setPanelState]
  )

  const handleToggleAssistantPanel = useCallback(
    (open?: boolean) => {
      setPanelState({ assistantPanelOpen: open ?? !panels.assistantPanelOpen })
    },
    [panels.assistantPanelOpen, setPanelState]
  )

  const handleResetOrientation = useCallback(() => {
    void bridge.resetOrientation()
  }, [bridge])

  const handleZoomIn = useCallback(() => {
    void bridge.zoomIn()
  }, [bridge])

  const handleZoomOut = useCallback(() => {
    void bridge.zoomOut()
  }, [bridge])

  return {
    handleAssistantPanelChange,
    handleLocate,
    handleOpenAssistantPanel,
    handleOpenQuickLocation,
    handleResetOrientation,
    handleResetView,
    handleSwitchBaseLayer,
    handleToggle3D,
    handleToggleAssistantPanel,
    handleToggleLayerList,
    handleToggleLayerManager,
    handleToggleSearch,
    handleToolbarAction,
    handleZoomIn,
    handleZoomOut
  }
}
