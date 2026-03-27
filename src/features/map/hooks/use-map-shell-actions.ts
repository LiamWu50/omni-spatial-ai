'use client'

import { useCallback } from 'react'

import type { MapRuntime } from '../services/map-runtime'
import type { BaseLayerType, MapTool, ShellPanelState } from '../types'

interface UseMapShellActionsOptions {
  runtime: MapRuntime
  activeTool: MapTool | null
  panels: ShellPanelState
  setPanelState: (updater: Partial<ShellPanelState>) => void
}

export function useMapShellActions({
  runtime,
  activeTool,
  panels,
  setPanelState
}: UseMapShellActionsOptions) {
  const handleLocate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      void runtime.locate({
        lng: Number(position.coords.longitude.toFixed(5)),
        lat: Number(position.coords.latitude.toFixed(5))
      })
    })
  }, [runtime])

  const handleResetView = useCallback(() => {
    void runtime.resetView()
  }, [runtime])

  const handleToolbarAction = useCallback(
    (actionId: MapTool) => {
      const nextTool = actionId === activeTool ? null : actionId
      runtime.setActiveTool(nextTool)
    },
    [activeTool, runtime]
  )

  const handleSwitchBaseLayer = useCallback(
    (layer: BaseLayerType) => {
      void runtime.switchBaseLayer(layer)
    },
    [runtime]
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

  const handleZoomIn = useCallback(() => {
    void runtime.zoomIn()
  }, [runtime])

  const handleZoomOut = useCallback(() => {
    void runtime.zoomOut()
  }, [runtime])

  return {
    handleAssistantPanelChange,
    handleLocate,
    handleOpenAssistantPanel,
    handleResetView,
    handleSwitchBaseLayer,
    handleToggleAssistantPanel,
    handleToggleLayerList,
    handleToggleLayerManager,
    handleToolbarAction,
    handleZoomIn,
    handleZoomOut
  }
}
