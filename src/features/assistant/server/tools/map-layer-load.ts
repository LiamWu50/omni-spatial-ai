import { tool } from 'ai'

import { extractBounds } from '@/features/map/lib/user-layers'
import {
  mapAssistantToolDescriptions,
  type MapClientAction,
  type MapLayerLoadInput,
  mapLayerLoadInputSchema,
  type ToolExecutionResult,
  toolExecutionResultSchema
} from '@/lib/ai/contracts'
import type { GeoJsonFeatureCollection } from '@/lib/gis/schema'

import { fetchGeoJsonFromUrl, inferLayerNameFromUrl, normalizeGeoJsonLayer, type SystemDatasetLoader } from './shared'

function buildToolResult(result: ToolExecutionResult) {
  return toolExecutionResultSchema.parse(result)
}

/**
 * 创建图层加载工具。
 */
export function createMapLayerLoadTool(fetchImpl: typeof fetch, systemDatasetLoader: SystemDatasetLoader) {
  return tool<MapLayerLoadInput, ToolExecutionResult>({
    description: mapAssistantToolDescriptions.map_layer_load,
    inputSchema: mapLayerLoadInputSchema,
    async execute(input) {
      try {
        let layer

        if (input.source.type === 'url') {
          layer = normalizeGeoJsonLayer({
            collection: await fetchGeoJsonFromUrl(fetchImpl, input.source.url),
            name: input.name ?? inferLayerNameFromUrl(input.source.url)
          })
        } else if (input.source.type === 'system') {
          layer = await systemDatasetLoader.load(input.source.datasetId)
        } else if (input.source.type === 'raw') {
          let rawData
          if (typeof input.source.data === 'string') {
            try {
              rawData = JSON.parse(input.source.data)
            } catch {
              throw new Error('传入的 GeoJSON 字符串无法解析为合法 JSON')
            }
          } else {
            rawData = input.source.data
          }

          let collectionData = rawData
          if (rawData && typeof rawData.type === 'string') {
            const geomTypes = [
              'Point',
              'MultiPoint',
              'LineString',
              'MultiLineString',
              'Polygon',
              'MultiPolygon',
              'GeometryCollection'
            ]
            if (geomTypes.includes(rawData.type)) {
              collectionData = {
                type: 'FeatureCollection',
                features: [
                  {
                    type: 'Feature',
                    properties: {},
                    geometry: rawData
                  }
                ]
              }
            } else if (rawData.type === 'Feature') {
              collectionData = { type: 'FeatureCollection', features: [rawData] }
            }
          }

          layer = normalizeGeoJsonLayer({
            collection: collectionData as GeoJsonFeatureCollection,
            name: input.name ?? '用户输入数据'
          })
        }

        if (!layer) {
          return buildToolResult({
            ok: false,
            message:
              input.source.type === 'system'
                ? `系统数据集 ${input.source.datasetId} 不存在，或当前未配置系统数据源。`
                : '未能加载 GeoJSON 图层。'
          })
        }

        const clientActions: MapClientAction[] = [{ type: 'layer.add', layer }]
        const bounds = extractBounds(layer.data as GeoJsonFeatureCollection)

        if (input.fitToData && bounds) {
          clientActions.push({
            type: 'view.fit_bounds',
            bounds
          })
        }

        return buildToolResult({
          ok: true,
          message: `已准备加载图层“${layer.name}”。`,
          clientActions
        })
      } catch (error) {
        return buildToolResult({
          ok: false,
          message: error instanceof Error ? error.message : '图层加载失败'
        })
      }
    }
  })
}
