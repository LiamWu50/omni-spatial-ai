import type { InferUIMessageChunk, TextStreamPart, UIMessageStreamWriter } from 'ai'

import type { MapAssistantUIMessage } from '@/lib/ai/contracts'

const GEOJSON_GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection'
])

type MapAssistantTextStreamPart = TextStreamPart<any>
type MapAssistantUIChunk = InferUIMessageChunk<MapAssistantUIMessage>

interface GeoJsonRawSummary {
  rootType: 'FeatureCollection' | 'Feature' | 'Geometry' | 'Unknown'
  featureCount?: number
  geometryType?: string
  approxBytes: number
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  try {
    return JSON.stringify(error)
  } catch {
    return 'An error occurred.'
  }
}

function getApproxBytes(value: unknown) {
  if (typeof value === 'string') {
    return Buffer.byteLength(value, 'utf8')
  }

  try {
    return Buffer.byteLength(JSON.stringify(value), 'utf8')
  } catch {
    return 0
  }
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function summarizeGeoJsonRawData(rawData: unknown): GeoJsonRawSummary {
  const parsedData = typeof rawData === 'string' ? safeParseJson(rawData) : rawData
  const approxBytes = getApproxBytes(rawData)

  if (!parsedData || typeof parsedData !== 'object') {
    return {
      rootType: 'Unknown',
      approxBytes
    }
  }

  const geoJsonType = 'type' in parsedData && typeof parsedData.type === 'string' ? parsedData.type : undefined

  if (geoJsonType === 'FeatureCollection') {
    const featureCount =
      'features' in parsedData && Array.isArray(parsedData.features) ? parsedData.features.length : undefined

    return {
      rootType: 'FeatureCollection',
      featureCount,
      approxBytes
    }
  }

  if (geoJsonType === 'Feature') {
    const geometryType =
      'geometry' in parsedData &&
      parsedData.geometry &&
      typeof parsedData.geometry === 'object' &&
      'type' in parsedData.geometry &&
      typeof parsedData.geometry.type === 'string'
        ? parsedData.geometry.type
        : undefined

    return {
      rootType: 'Feature',
      geometryType,
      approxBytes
    }
  }

  if (geoJsonType && GEOJSON_GEOMETRY_TYPES.has(geoJsonType)) {
    return {
      rootType: 'Geometry',
      geometryType: geoJsonType,
      approxBytes
    }
  }

  return {
    rootType: 'Unknown',
    approxBytes
  }
}

function createRawGeoJsonPlaceholder(summary: GeoJsonRawSummary) {
  const details = [
    `rootType=${summary.rootType}`,
    summary.featureCount !== undefined ? `featureCount=${summary.featureCount}` : null,
    summary.geometryType ? `geometryType=${summary.geometryType}` : null,
    `approxBytes=${summary.approxBytes}`
  ]
    .filter(Boolean)
    .join(', ')

  return `[raw GeoJSON omitted in stream: ${details}]`
}

export function normalizeToolInputForStream(toolName: string, input: unknown) {
  if (
    toolName !== 'map_layer_load' ||
    !input ||
    typeof input !== 'object' ||
    !('source' in input) ||
    !input.source ||
    typeof input.source !== 'object' ||
    !('type' in input.source) ||
    input.source.type !== 'raw' ||
    !('data' in input.source)
  ) {
    return input
  }

  const summary = summarizeGeoJsonRawData(input.source.data)

  return {
    ...input,
    source: {
      ...input.source,
      data: createRawGeoJsonPlaceholder(summary),
      summary
    }
  }
}

/**
 * 将 AI SDK 的底层 fullStream 事件压缩为更精简的 UIMessage chunk。
 * 关键点：
 * 1. 丢弃 tool-input-start / delta / end，避免超大参数被拆成很多事件。
 * 2. 工具输入只在 tool-call 阶段一次性发送完整对象。
 */
export function normalizeTextStreamPart(part: MapAssistantTextStreamPart): MapAssistantUIChunk | undefined {
  switch (part.type) {
    case 'start':
      return { type: 'start' }
    case 'finish':
      return {
        type: 'finish',
        finishReason: part.finishReason
      }
    case 'start-step':
      return { type: 'start-step' }
    case 'finish-step':
      return { type: 'finish-step' }
    case 'abort':
      return {
        type: 'abort',
        reason: part.reason
      }
    case 'error':
      return {
        type: 'error',
        errorText: getErrorText(part.error)
      }
    case 'text-start':
      return {
        type: 'text-start',
        id: part.id,
        providerMetadata: part.providerMetadata
      }
    case 'text-delta':
      return {
        type: 'text-delta',
        id: part.id,
        delta: part.text,
        providerMetadata: part.providerMetadata
      }
    case 'text-end':
      return {
        type: 'text-end',
        id: part.id,
        providerMetadata: part.providerMetadata
      }
    case 'reasoning-start':
      return {
        type: 'reasoning-start',
        id: part.id,
        providerMetadata: part.providerMetadata
      }
    case 'reasoning-delta':
      return {
        type: 'reasoning-delta',
        id: part.id,
        delta: part.text,
        providerMetadata: part.providerMetadata
      }
    case 'reasoning-end':
      return {
        type: 'reasoning-end',
        id: part.id,
        providerMetadata: part.providerMetadata
      }
    case 'file':
      return {
        type: 'file',
        mediaType: part.file.mediaType,
        url: `data:${part.file.mediaType};base64,${part.file.base64}`,
        providerMetadata: part.providerMetadata
      }
    case 'tool-input-start':
    case 'tool-input-delta':
    case 'tool-input-end':
    case 'raw':
    case 'source':
      return undefined
    case 'tool-call': {
      const input = normalizeToolInputForStream(part.toolName, part.input)

      if (part.invalid) {
        return {
          type: 'tool-input-error',
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          input,
          providerExecuted: part.providerExecuted,
          providerMetadata: part.providerMetadata,
          dynamic: part.dynamic,
          errorText: getErrorText(part.error),
          title: part.title
        }
      }

      return {
        type: 'tool-input-available',
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        input,
        providerExecuted: part.providerExecuted,
        providerMetadata: part.providerMetadata,
        dynamic: part.dynamic,
        title: part.title
      }
    }
    case 'tool-result':
      return {
        type: 'tool-output-available',
        toolCallId: part.toolCallId,
        output: part.output,
        providerExecuted: part.providerExecuted,
        providerMetadata: part.providerMetadata,
        dynamic: part.dynamic,
        preliminary: part.preliminary
      }
    case 'tool-error':
      return {
        type: 'tool-output-error',
        toolCallId: part.toolCallId,
        errorText: getErrorText(part.error),
        providerExecuted: part.providerExecuted,
        providerMetadata: part.providerMetadata,
        dynamic: part.dynamic
      }
    case 'tool-output-denied':
      return {
        type: 'tool-output-denied',
        toolCallId: part.toolCallId
      }
    case 'tool-approval-request':
      return {
        type: 'tool-approval-request',
        approvalId: part.approvalId,
        toolCallId: part.toolCall.toolCallId
      }
  }
}

export async function writeNormalizedUIMessageStream(
  writer: UIMessageStreamWriter<MapAssistantUIMessage>,
  stream: AsyncIterable<MapAssistantTextStreamPart>
) {
  for await (const part of stream) {
    const chunk = normalizeTextStreamPart(part)

    if (chunk) {
      writer.write(chunk)
    }
  }
}
