'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import type { PropsWithChildren } from 'react'

import { useMapAssistantRuntime } from '../../hooks/use-map-assistant-runtime'
import type { BaseLayerType, MapViewportState, ShellPanelState } from '../../types'

type MapAssistantProviderProps = PropsWithChildren<{
  viewport: MapViewportState
  activeBaseLayer: BaseLayerType
  panels: ShellPanelState
  visibleLayerCount: number
  onLocate: () => void
  onResetView: () => void
  onSwitchBaseLayer: (layer: BaseLayerType) => void
  onToggleLayerList: () => void
  onToggleAssistantPanel: (open?: boolean) => void
}>

export function MapAssistantProvider({
  children,
  viewport,
  activeBaseLayer,
  panels,
  visibleLayerCount,
  onLocate,
  onResetView,
  onSwitchBaseLayer,
  onToggleLayerList,
  onToggleAssistantPanel
}: MapAssistantProviderProps) {
  const runtime = useMapAssistantRuntime({
    viewport,
    activeBaseLayer,
    panels,
    visibleLayerCount,
    onLocate,
    onResetView,
    onSwitchBaseLayer,
    onToggleLayerList,
    onToggleAssistantPanel
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
  )
}
