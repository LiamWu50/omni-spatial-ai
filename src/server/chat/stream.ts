import 'server-only'

import { createOpenAI } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse
} from 'ai'
import type { MapAssistantUIMessage } from '@/features/assistant/lib/contracts'

import { createMapAssistantTools } from './tools'
import { resolveChatModelId } from '@/features/map/lib/models'
import { MAP_CHAT_SYSTEM_PROMPT } from './prompts'

export interface ChatRequestBody {
  messages: MapAssistantUIMessage[]
  model?: string
}

export function isDashscopeConfigError(error: unknown) {
  return error instanceof Error && error.message.includes('DASHSCOPE_API_KEY')
}

function getDashscopeClient() {
  const apiKey = process.env.DASHSCOPE_API_KEY

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
  const tools = createMapAssistantTools()

  const stream = createUIMessageStream<MapAssistantUIMessage>({
    execute: async ({ writer }) => {
      const result = streamText({
        model: qwen.chat(resolvedModel),
        temperature: 0.2,
        system: MAP_CHAT_SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        tools,
        stopWhen: stepCountIs(8),
        experimental_transform: smoothStream({
          chunking: zhStreamSegmenter
        }),
        onError({ error }) {
          console.error('Map assistant streamText error:', error)
        }
      })

      for await (const chunk of result.toUIMessageStream<MapAssistantUIMessage>()) {
        writer.write(chunk)
      }
    }
  })

  return createUIMessageStreamResponse({ stream })
}

export function createChatErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'AI 对话请求失败'

  if (isDashscopeConfigError(error)) {
    return new Response(
      'AI 服务暂未完成配置：当前缺少 `DASHSCOPE_API_KEY`。请在项目根目录创建 `.env.local`，并配置有效的 DashScope API Key 后重启开发服务。',
      { status: 500 }
    )
  }

  return new Response(`AI 服务暂时不可用：${message}`, { status: 500 })
}
