import 'server-only'

import { createOpenAI } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText,
  type UIMessage
} from 'ai'

import { resolveChatModelId } from '@/features/map/lib/models'

import { MAP_CHAT_SYSTEM_PROMPT } from './prompts'

export interface ChatRequestBody {
  messages: UIMessage[]
  model?: string
}

export function isDashscopeConfigError(error: unknown) {
  return error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')
}

function createAssistantTextResponse(text: string) {
  const stream = createUIMessageStream<UIMessage>({
    execute: ({ writer }) => {
      const messageId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `assistant-${Date.now()}`
      const textPartId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `text-${Date.now()}`

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
        finishReason: 'error'
      })
    }
  })

  return createUIMessageStreamResponse({ stream })
}

function getDashscopeClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY
  console.log('DASHSCOPE_API_KEY:', apiKey)

  if (!apiKey) {
    throw new Error('缺少 DASHSCOPE_API_KEY 配置')
  }

  return createOpenAI({
    apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  })
}

const zhStreamSegmenter = new Intl.Segmenter('zh', {
  granularity: 'word'
})

export async function streamChat(body: ChatRequestBody) {
  const qwen = getDashscopeClient()
  const resolvedModel = resolveChatModelId(body.model)
  const messages = Array.isArray(body.messages) ? body.messages : []

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: qwen.chat(resolvedModel),
        temperature: 0.2,
        system: MAP_CHAT_SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(8),
        experimental_transform: smoothStream({
          chunking: zhStreamSegmenter
        }),
        onError({ error }) {
          console.error('Map assistant streamText error:', error)
        }
      })

      writer.merge(result.toUIMessageStream())
    }
  })

  return createUIMessageStreamResponse({ stream })
}

export function createChatErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'AI 对话请求失败'

  if (isDashscopeConfigError(error)) {
    return createAssistantTextResponse(
      'AI 服务暂未完成配置：当前缺少 `DASHSCOPE_API_KEY`。请在项目根目录创建 `.env.local`，并配置有效的 DashScope API Key 后重启开发服务。'
    )
  }

  return createAssistantTextResponse(`AI 服务暂时不可用：${message}`)
}
