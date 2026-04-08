'use client'

import { useChat } from '@ai-sdk/react'
import type { AssistantRuntime } from '@assistant-ui/react'
import { AssistantChatTransport, useAISDKRuntime } from '@assistant-ui/react-ai-sdk'
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { type CurrentLayerItem, type MapClientAction } from '@/lib/ai/contracts'
import { type ChatModelId, DEFAULT_CHAT_MODEL } from '@/lib/ai/models'

import { useMapContext } from '../../map/components/map-provider'
import { executeMapClientActions } from '../lib/client-action-executor'

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

  // 创建一个自定义的 fetch 函数来动态添加图层信息
  const originalFetch = useCallback(async (url: RequestInfo | URL, options?: RequestInit) => {
    const currentContext = mapContextRef.current

    // 动态获取当前图层列表
    const currentLayers = currentContext.shell.derived.layers.map((layer): CurrentLayerItem => ({
      id: layer.id,
      name: layer.name
    }))

    // 添加调试日志
    console.log('[AI Chat] 发送请求时的图层列表:', currentLayers)

    // 添加模型和图层信息到请求体
    const modifiedOptions: RequestInit = {
      ...options,
      body: JSON.stringify({
        ...(options?.body ? JSON.parse(options.body as string) : {}),
        model: selectedModel,
        currentLayers
      })
    }

    return fetch(url, modifiedOptions)
  }, [selectedModel])

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/chat',
        fetch: originalFetch
      }),
    [originalFetch]
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
