import type { UIMessageStreamWriter } from 'ai'

import type { MapAssistantUIMessage, MapLayerLoadInput } from '@/lib/ai/contracts'

import { normalizeToolInputForStream } from './ui-stream-normalizer'

const GEOJSON_GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection'
])

const LOAD_INTENT_PATTERN = /(加载|导入|显示|展示|渲染|放到地图|加到地图|帮我加载)/

interface DirectGeoJsonLoadRequest {
  input: MapLayerLoadInput
  responseText: string
}

interface MapLayerLoadToolLike {
  execute?: (input: MapLayerLoadInput, ...args: any[]) => any
}

function extractMessageText(message: MapAssistantUIMessage) {
  if (!Array.isArray(message.parts)) {
    return ''
  }

  return message.parts
    .filter(
      (part): part is Extract<(typeof message.parts)[number], { type: 'text'; text: string }> => part.type === 'text'
    )
    .map((part) => part.text)
    .join('\n')
    .trim()
}

function extractLeadingJsonObject(text: string) {
  const source = text.trim()

  if (!source.startsWith('{')) {
    return null
  }

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (char === '{') {
      depth += 1
      continue
    }

    if (char === '}') {
      depth -= 1

      if (depth === 0) {
        return {
          jsonText: source.slice(0, index + 1),
          trailingText: source.slice(index + 1).trim()
        }
      }
    }
  }

  return null
}

function isGeoJsonLike(value: unknown) {
  if (!value || typeof value !== 'object' || !('type' in value) || typeof value.type !== 'string') {
    return false
  }

  if (value.type === 'FeatureCollection' || value.type === 'Feature') {
    return true
  }

  return GEOJSON_GEOMETRY_TYPES.has(value.type)
}

export function detectDirectGeoJsonLoadRequest(messages: MapAssistantUIMessage[]): DirectGeoJsonLoadRequest | null {
  const lastMessage = [...messages].reverse().find((message) => message.role === 'user')

  if (!lastMessage) {
    return null
  }

  const text = extractMessageText(lastMessage)
  const extracted = extractLeadingJsonObject(text)

  if (!extracted) {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extracted.jsonText)
  } catch {
    return null
  }

  if (!isGeoJsonLike(parsed)) {
    return null
  }

  if (extracted.trailingText && !LOAD_INTENT_PATTERN.test(extracted.trailingText)) {
    return null
  }

  return {
    input: {
      source: {
        type: 'raw',
        data: parsed as Record<string, unknown>
      },
      name: '用户输入数据',
      fitToData: true
    },
    responseText: '已帮你加载这份 GeoJSON 数据，并定位到数据范围。'
  }
}

export async function writeDirectGeoJsonLoadStream(
  writer: UIMessageStreamWriter<MapAssistantUIMessage>,
  tool: MapLayerLoadToolLike,
  request: DirectGeoJsonLoadRequest
) {
  if (typeof tool.execute !== 'function') {
    throw new Error('map_layer_load 工具当前不可执行')
  }

  writer.write({ type: 'start' })
  writer.write({ type: 'start-step' })
  writer.write({
    type: 'tool-input-available',
    toolCallId: 'direct-map-layer-load',
    toolName: 'map_layer_load',
    input: normalizeToolInputForStream('map_layer_load', request.input)
  })

  try {
    const output = await tool.execute(request.input)

    writer.write({
      type: 'tool-output-available',
      toolCallId: 'direct-map-layer-load',
      output
    })

    const responseText = output.ok ? request.responseText : output.message

    writer.write({
      type: 'text-start',
      id: 'direct-map-layer-load-text'
    })
    writer.write({
      type: 'text-delta',
      id: 'direct-map-layer-load-text',
      delta: responseText
    })
    writer.write({
      type: 'text-end',
      id: 'direct-map-layer-load-text'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载 GeoJSON 数据失败'

    writer.write({
      type: 'tool-output-error',
      toolCallId: 'direct-map-layer-load',
      errorText: message
    })
    writer.write({
      type: 'text-start',
      id: 'direct-map-layer-load-text'
    })
    writer.write({
      type: 'text-delta',
      id: 'direct-map-layer-load-text',
      delta: message
    })
    writer.write({
      type: 'text-end',
      id: 'direct-map-layer-load-text'
    })
  }

  writer.write({ type: 'finish-step' })
  writer.write({
    type: 'finish',
    finishReason: 'stop'
  })
}
