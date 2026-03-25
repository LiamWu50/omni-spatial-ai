import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

import { runAnalysis } from '@/lib/analysis/service'
import { env } from '@/lib/env'
import {
  type AnalysisRequest,
  createActionMeta,
  type GeoJsonFeatureCollection,
  type GisAction,
  type LayerDescriptor,
  parseGisActions
} from '@/lib/gis/schema'

import { createMockIntent, type SpatialAgentDraft } from './mock-intent'
import { spatialSystemPrompt } from './system-prompt'

export interface SpatialChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SpatialPromptInput {
  prompt: string
  layers: LayerDescriptor[]
}

export interface SpatialAssistantResponse {
  reply: string
  actions: GisAction[]
  toolSummaries: string[]
}

function findLayer(layers: LayerDescriptor[], layerId: string) {
  return layers.find((layer) => layer.id === layerId)
}

async function expandActions(
  actions: GisAction[],
  layers: LayerDescriptor[]
): Promise<{ actions: GisAction[]; toolSummaries: string[] }> {
  const expanded: GisAction[] = []
  const summaries: string[] = []
  const currentLayers = new Map(layers.map((layer) => [layer.id, layer] as const))

  for (const action of actions) {
    if (action.type !== 'CALC_BUFFER') {
      expanded.push(action)
      if (action.type === 'ADD_LAYER') {
        currentLayers.set(action.payload.layer.id, action.payload.layer)
      }
      continue
    }

    const layer = findLayer([...currentLayers.values()], action.payload.layerId)
    if (!layer) {
      summaries.push(`未找到缓冲区分析源图层：${action.payload.layerId}`)
      continue
    }

    const result = await runAnalysis({
      action: 'buffer',
      layer,
      distance: action.payload.distance,
      units: action.payload.units
    } satisfies AnalysisRequest)

    if (result.outputLayer) {
      currentLayers.set(result.outputLayer.id, result.outputLayer)
      expanded.push({
        type: 'ADD_LAYER',
        payload: {
          layer: result.outputLayer
        },
        meta: createActionMeta('analysis')
      })

      const data = result.outputLayer.data as GeoJsonFeatureCollection & {
        bbox?: [number, number, number, number]
      }
      if (data.bbox) {
        expanded.push({
          type: 'FIT_BOUNDS',
          payload: {
            bounds: data.bbox
          },
          meta: createActionMeta('analysis')
        })
      }
      summaries.push(result.summary)
    }
  }

  return {
    actions: expanded,
    toolSummaries: summaries
  }
}

async function runModelIntent(prompt: string): Promise<SpatialAgentDraft> {
  if (!env.OPENAI_API_KEY) {
    return createMockIntent(prompt)
  }

  const client = createOpenAI({
    apiKey: env.OPENAI_API_KEY
  })

  const result = await generateText({
    model: client(env.OPENAI_MODEL),
    system: spatialSystemPrompt,
    prompt
  })

  const text = result.text.trim()
  const parsed = JSON.parse(text) as {
    reply?: string
    actions?: unknown
  }

  return {
    reply: parsed.reply ?? '已完成空间指令解析。',
    actions: parseGisActions(parsed.actions ?? [])
  }
}

export async function runSpatialAssistant(input: SpatialPromptInput): Promise<SpatialAssistantResponse> {
  const draft = await runModelIntent(input.prompt)
  const expanded = await expandActions(draft.actions, input.layers)

  return {
    reply: [draft.reply, ...expanded.toolSummaries].filter(Boolean).join(' '),
    actions: expanded.actions,
    toolSummaries: expanded.toolSummaries
  }
}
