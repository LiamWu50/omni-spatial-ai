'use client'

import { useChat } from '@ai-sdk/react'
import type { AssistantRuntime } from '@assistant-ui/react'
import { AssistantChatTransport, useAISDKRuntime } from '@assistant-ui/react-ai-sdk'
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useMapContext } from '../../map/components/map-provider'
import { type ChatModelId, DEFAULT_CHAT_MODEL } from '../../map/lib/models'
import { executeMapClientActions } from '../lib/client-action-executor'
import { type MapClientAction } from '../lib/contracts'

interface MapAssistantRuntimeState {
  runtime: AssistantRuntime
  selectedModel: ChatModelId
  setSelectedModel: Dispatch<SetStateAction<ChatModelId>>
  resetConversation: () => void
  composerResetKey: number
}

export function useMapAssistantRuntime(): MapAssistantRuntimeState {
  const [selectedModel, setSelectedModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL)
  const [composerResetKey, setComposerResetKey] = useState(0)
  const mapContext = useMapContext()

  const mapContextRef = useRef(mapContext)
  useEffect(() => {
    mapContextRef.current = mapContext
  }, [mapContext])

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/chat',
        body: {
          model: selectedModel
        }
      }),
    [selectedModel]
  )

  const chatOptions: any = {
    transport,
    onFinish: (messageObject: any) => {
      const message = 'message' in messageObject ? messageObject.message : messageObject
      if (!message) return

      const invocations: any[] = message.toolInvocations || message.parts || []

      for (const part of invocations) {
        let result: any = null

        // Handle various AI SDK tool invocation shapes dynamically
        if (part.state === 'result' && part.result) {
          result = part.result
        } else if (part.type === 'tool-invocation' && part.toolInvocation?.state === 'result') {
          result = part.toolInvocation.result
        } else if (part.type?.startsWith('tool-') && part.result) {
          result = part.result
        } else if (part.type?.startsWith('tool-') && part.output) {
          result = part.output
        }

        if (result?.clientActions && Array.isArray(result.clientActions)) {
          const currentContext = mapContextRef.current
          executeMapClientActions(result.clientActions as MapClientAction[], {
            runtime: currentContext.runtime,
            locateUser: currentContext.actions.locate
          }).catch((error) => {
            toast.error(error instanceof Error ? error.message : '地图动作执行失败')
          })
        }
      }
    },
    onError: (error: Error) => {
      console.error('Map assistant chat error:', error)
      toast.error(error.message || 'AI 对话失败，请稍后重试')
    }
  }

  const chat = useChat(chatOptions)
  const resetConversation = useCallback(() => {
    chat.stop()
    chat.clearError()
    chat.setMessages([])
    setComposerResetKey((currentKey) => currentKey + 1)
  }, [chat])

  const runtime = useAISDKRuntime(chat)

  return {
    runtime,
    selectedModel,
    setSelectedModel,
    resetConversation,
    composerResetKey
  }
}
