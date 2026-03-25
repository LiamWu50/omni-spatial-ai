import bbox from '@turf/bbox'
import buffer from '@turf/buffer'

import {
  type AnalysisRequest,
  type AnalysisResult,
  analysisRequestSchema,
  type GeoJsonFeatureCollection,
  layerDescriptorSchema
} from '@/lib/gis/schema'

function ensureFeatureCollection(data: unknown) {
  if (data && typeof data === 'object' && 'type' in data && (data as { type: string }).type === 'FeatureCollection') {
    return data as GeoJsonFeatureCollection
  }
  throw new Error('当前仅支持 GeoJSON FeatureCollection 分析')
}

export async function runAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  const parsed = analysisRequestSchema.parse(request)

  if (parsed.action === 'query') {
    const rows = ensureFeatureCollection(parsed.layer.data).features.map((feature) => ({
      ...feature.properties
    }))
    return {
      summary: `已返回 ${rows.length} 条属性记录`,
      table: rows
    }
  }

  const source = ensureFeatureCollection(parsed.layer.data)
  const bufferedRaw = buffer(source as never, parsed.distance ?? 1, {
    units: parsed.units ?? 'meters'
  }) as unknown

  const buffered =
    bufferedRaw &&
    typeof bufferedRaw === 'object' &&
    'type' in bufferedRaw &&
    (bufferedRaw as { type?: string }).type === 'FeatureCollection'
      ? (bufferedRaw as GeoJsonFeatureCollection)
      : {
          type: 'FeatureCollection' as const,
          features: bufferedRaw ? [bufferedRaw as GeoJsonFeatureCollection['features'][number]] : []
        }

  const resultLayer = layerDescriptorSchema.parse({
    id: `${parsed.layer.id}-buffer`,
    name: `${parsed.layer.name} 缓冲区`,
    sourceType: 'geojson',
    data: buffered,
    geometryType: 'polygon',
    visible: true,
    style: {
      color: '#f59e0b',
      opacity: 0.32
    }
  })

  return {
    summary: `已生成 ${parsed.distance} ${parsed.units ?? 'meters'} 缓冲区`,
    outputLayer: {
      ...resultLayer,
      data: {
        ...buffered,
        bbox: bbox(buffered as never)
      }
    }
  }
}
