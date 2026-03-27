'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import type { MapRuntime } from '../services/map-runtime'
import type { BaseLayerType, MapTool } from '../types'
import type { UseMapShellResult } from './use-map-shell'

interface UseMapShellActionsOptions {
  runtime: MapRuntime
  shell: Pick<UseMapShellResult, 'actions' | 'state'>
}

export function useMapShellActions({ runtime, shell }: UseMapShellActionsOptions) {
  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('当前浏览器不支持定位能力')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void runtime.locate({
          lng: Number(position.coords.longitude.toFixed(5)),
          lat: Number(position.coords.latitude.toFixed(5))
        })
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED ? '定位权限被拒绝，请检查浏览器授权' : '定位失败，请稍后重试'

        toast.error(message)
      }
    )
  }, [runtime])

  const resetView = useCallback(() => {
    void runtime.resetView()
  }, [runtime])

  const toolbarAction = useCallback(
    (actionId: MapTool) => {
      const nextTool = actionId === shell.state.activeTool ? null : actionId
      runtime.setActiveTool(nextTool)
    },
    [runtime, shell.state.activeTool]
  )

  const switchBaseLayer = useCallback(
    (layer: BaseLayerType) => {
      void runtime.switchBaseLayer(layer)
    },
    [runtime]
  )

  const toggleLayerManager = useCallback(() => {
    shell.actions.setPanelState({ layerManagerOpen: !shell.state.panels.layerManagerOpen })
  }, [shell.actions, shell.state.panels.layerManagerOpen])

  const toggleLayerList = useCallback(() => {
    shell.actions.setPanelState({
      layerManagerOpen: true
    })
  }, [shell.actions])

  const openAssistantPanel = useCallback(() => {
    shell.actions.setPanelState({ assistantPanelOpen: true })
  }, [shell.actions])

  const assistantPanelChange = useCallback(
    (open: boolean) => {
      shell.actions.setPanelState({ assistantPanelOpen: open })
    },
    [shell.actions]
  )

  const toggleAssistantPanel = useCallback(
    (open?: boolean) => {
      shell.actions.setPanelState({ assistantPanelOpen: open ?? !shell.state.panels.assistantPanelOpen })
    },
    [shell.actions, shell.state.panels.assistantPanelOpen]
  )

  const zoomIn = useCallback(() => {
    void runtime.zoomIn()
  }, [runtime])

  const zoomOut = useCallback(() => {
    void runtime.zoomOut()
  }, [runtime])

  return {
    actions: {
      assistantPanelChange,
      locate,
      openAssistantPanel,
      resetView,
      switchBaseLayer,
      toggleAssistantPanel,
      toggleLayerList,
      toggleLayerManager,
      toolbarAction,
      zoomIn,
      zoomOut
    }
  }
}
