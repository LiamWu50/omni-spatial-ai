'use client'

import { AssistantRuntimeProvider, Tools, useAui } from '@assistant-ui/react'
import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useMemo } from 'react'

import type { ChatModelId } from '../map/lib/models'
import { mapAssistantToolkit } from './components/messages'
import { useMapAssistantRuntime } from './hooks/use-assistant-runtime'

type MapAssistantProviderProps = PropsWithChildren<{}>

interface MapAssistantChatContextValue {
  selectedModel: ChatModelId
  setSelectedModel: Dispatch<SetStateAction<ChatModelId>>
}

const MapAssistantChatContext = createContext<MapAssistantChatContextValue | null>(null)

export function MapAssistantProvider({ children }: MapAssistantProviderProps) {
  const { runtime: assistantRuntime, selectedModel, setSelectedModel } = useMapAssistantRuntime()
  const aui = useAui({
    tools: Tools({
      toolkit: mapAssistantToolkit
    })
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
      <AssistantRuntimeProvider aui={aui} runtime={assistantRuntime}>
        {children}
      </AssistantRuntimeProvider>
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
