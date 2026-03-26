'use client'

import { useCallback } from 'react'

import type { MapBridge } from '../helps/map-bridge-service'
import type { BaseLayerType, MapTool, MapViewportState, ShellPanelState } from '../types'

interface UseMapShellActionsOptions {
  bridge: MapBridge
  activeTool: MapTool | null
  panels: ShellPanelState
  setActiveTool: (tool: MapTool | null) => void
  setPanelState: (updater: Partial<ShellPanelState>) => void
  viewport: MapViewportState
}

export function useMapShellActions({
  bridge,
  activeTool,
  panels,
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

  const handleToggle3D = useCallback(() => {
    const nextEngine = viewport.is3D ? 'mapbox' : 'cesium'
    void bridge.switchEngine(nextEngine)
  }, [bridge, viewport.is3D])

  const handleToolbarAction = useCallback(
    (actionId: MapTool) => {
      const nextTool = actionId === activeTool ? null : actionId
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
      layerManagerOpen: true
    })
  }, [setPanelState])

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
    handleResetOrientation,
    handleResetView,
    handleSwitchBaseLayer,
    handleToggle3D,
    handleToggleAssistantPanel,
    handleToggleLayerList,
    handleToggleLayerManager,
    handleToolbarAction,
    handleZoomIn,
    handleZoomOut
  }
}
