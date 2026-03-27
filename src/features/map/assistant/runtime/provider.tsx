'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useMemo } from 'react'

import type { ChatModelId } from '../../lib/models'
import type { BaseLayerType, MapViewportState, ShellPanelState } from '../../types'
import { useMapAssistantRuntime } from './use-map-assistant-runtime'

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

interface MapAssistantChatContextValue {
  selectedModel: ChatModelId
  setSelectedModel: Dispatch<SetStateAction<ChatModelId>>
}

const MapAssistantChatContext = createContext<MapAssistantChatContextValue | null>(null)

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
  const { runtime, selectedModel, setSelectedModel } = useMapAssistantRuntime({
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

  const contextValue = useMemo(
    () => ({
      selectedModel,
      setSelectedModel
    }),
    [selectedModel, setSelectedModel]
  )

  return (
    <MapAssistantChatContext.Provider value={contextValue}>
      <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
    </MapAssistantChatContext.Provider>
  )
}

export function useMapAssistantChatContext() {
  const context = useContext(MapAssistantChatContext)

  if (!context) {
    throw new Error('useMapAssistantChatContext must be used within a MapAssistantProvider')
  }

  return context
}
