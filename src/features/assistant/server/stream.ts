import 'server-only'

import { createOpenAI } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  stepCountIs,
  streamText
} from 'ai'

import type { ChatRequestBody } from '@/lib/ai/contracts'
import { resolveChatModelId } from '@/lib/ai/models'

import { detectDirectGeoJsonLoadRequest, writeDirectGeoJsonLoadStream } from './direct-geojson-load'
import { MAP_CHAT_SYSTEM_PROMPT } from './prompts'
import { createMapAssistantTools } from './tools'
import { writeNormalizedUIMessageStream } from './ui-stream-normalizer'

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
  const directGeoJsonLoadRequest = detectDirectGeoJsonLoadRequest(messages)

  // 添加调试日志
  console.log('[AI Chat] 服务端接收到的图层列表:', body.currentLayers)

  // 构建图层上下文
  const layersContext = buildLayersContext(body.currentLayers)
  console.log('[AI Chat] 构建的图层上下文:', layersContext)

  const stream = createUIMessageStream<any>({
    execute: async ({ writer }) => {
      if (directGeoJsonLoadRequest) {
        await writeDirectGeoJsonLoadStream(writer, tools.map_layer_load, directGeoJsonLoadRequest)
        return
      }

      const result = streamText({
        model: qwen.chat(resolvedModel),
        temperature: 0.2,
        system: MAP_CHAT_SYSTEM_PROMPT + layersContext,
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

      await writeNormalizedUIMessageStream(writer, result.fullStream)
    }
  })

  return createUIMessageStreamResponse({ stream })
}

/**
 * 构建图层列表的上下文信息，添加到系统提示中
 */
function buildLayersContext(currentLayers?: ChatRequestBody['currentLayers']): string {
  if (!currentLayers || currentLayers.length === 0) {
    return '\n\n当前地图上没有图层。'
  }

  const layersList = currentLayers
    .map(layer => `- ${layer.name} (图层ID: ${layer.id})`)
    .join('\n')

  return `\n\n当前地图图层列表：\n${layersList}\n\n注意：当用户提到"图层"但未指定具体图层时，请先询问用户要修改哪个图层，或根据上下文合理推断。`
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
