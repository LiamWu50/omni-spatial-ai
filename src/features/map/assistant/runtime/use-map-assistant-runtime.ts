'use client'

import { useChat } from '@ai-sdk/react'
import type { AssistantRuntime } from '@assistant-ui/react'
import { AssistantChatTransport, useAISDKRuntime } from '@assistant-ui/react-ai-sdk'
import { createUIMessageStream, type UIMessage } from 'ai'
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { type ChatModelId, DEFAULT_CHAT_MODEL } from '../../lib/models'
import { executeLocalMapCommand, getLatestUserText, type LocalMapCommandContext } from '../lib/local-map-command'

interface MapAssistantRuntimeOptions extends LocalMapCommandContext {}

interface MapAssistantRuntimeState {
  runtime: AssistantRuntime
  selectedModel: ChatModelId
  setSelectedModel: Dispatch<SetStateAction<ChatModelId>>
}

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: 'map-assistant-welcome',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: '地图助手已就绪。你可以让我帮你定位、切换影像底图、打开图层管理，也可以直接问我普通问题。',
        state: 'done'
      }
    ]
  }
]

function createClientId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createLocalAssistantStream(text: string) {
  const messageId = createClientId('assistant')
  const textPartId = createClientId('text')

  return createUIMessageStream<UIMessage>({
    execute: ({ writer }) => {
      writer.write({
        type: 'start',
        messageId
      })
      writer.write({
        type: 'text-start',
        id: textPartId
      })
      writer.write({
        type: 'text-delta',
        id: textPartId,
        delta: text
      })
      writer.write({
        type: 'text-end',
        id: textPartId
      })
      writer.write({
        type: 'finish',
        finishReason: 'stop'
      })
    }
  })
}

class MapAssistantChatTransport extends AssistantChatTransport<UIMessage> {
  constructor(
    private readonly resolveLocalResponse: (messages: UIMessage[]) => string | null,
    resolveModel: () => ChatModelId
  ) {
    super({
      api: '/api/chat',
      body: {
        get model() {
          return resolveModel()
        }
      }
    })
  }

  override async sendMessages(options: Parameters<AssistantChatTransport<UIMessage>['sendMessages']>[0]) {
    if (options.trigger !== 'submit-message') {
      return super.sendMessages(options)
    }

    const localResponse = this.resolveLocalResponse(options.messages)

    if (!localResponse) {
      return super.sendMessages(options)
    }

    return createLocalAssistantStream(localResponse)
  }
}

export function useMapAssistantRuntime(options: MapAssistantRuntimeOptions): MapAssistantRuntimeState {
  const [selectedModel, setSelectedModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL)
  const optionsRef = useRef(options)
  const selectedModelRef = useRef(selectedModel)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    selectedModelRef.current = selectedModel
  }, [selectedModel])

  const transport = useMemo(
    () =>
      new MapAssistantChatTransport(
        (messages) => {
          const prompt = getLatestUserText(messages)
          const result = executeLocalMapCommand(prompt, optionsRef.current)
          return result?.responseText ?? null
        },
        () => selectedModelRef.current
      ),
    []
  )

  const chat = useChat<UIMessage>({
    messages: INITIAL_MESSAGES,
    transport,
    onError: (error) => {
      console.error('Map assistant chat error:', error)
      toast.error(error.message || 'AI 对话失败，请稍后重试')
    }
  })

  const runtime = useAISDKRuntime(chat)

  useEffect(() => {
    transport.setRuntime(runtime)
  }, [runtime, transport])

  return {
    runtime,
    selectedModel,
    setSelectedModel
  }
}
