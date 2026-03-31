import { tool } from 'ai'
import {
  type MapClientAction,
  type MapLayerLoadInput,
  mapAssistantToolDescriptions,
  mapLayerLoadInputSchema,
  type ToolExecutionResult,
  toolExecutionResultSchema
} from '@/features/assistant/lib/contracts'
import { extractBounds } from '@/features/map/lib/user-layers'
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
        const layer =
          input.source.type === 'url'
            ? normalizeGeoJsonLayer({
                collection: await fetchGeoJsonFromUrl(fetchImpl, input.source.url),
                name: input.name ?? inferLayerNameFromUrl(input.source.url)
              })
            : await systemDatasetLoader.load(input.source.datasetId)

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
