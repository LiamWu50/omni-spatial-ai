import { tool } from 'ai'

import {
  mapAssistantToolDescriptions,
  type MapLayerStyleInput,
  mapLayerStyleInputSchema,
  type ToolExecutionResult,
  toolExecutionResultSchema
} from '@/features/assistant/lib/contracts'

function buildToolResult(result: ToolExecutionResult) {
  return toolExecutionResultSchema.parse(result)
}

/**
 * 创建图层样式更新工具。
 */
export function createMapLayerStyleTool() {
  return tool<MapLayerStyleInput, ToolExecutionResult>({
    description: mapAssistantToolDescriptions.map_layer_style,
    inputSchema: mapLayerStyleInputSchema,
    execute(input) {
      return buildToolResult({
        ok: true,
        message: `已准备更新图层 ${input.layerId} 的显示样式。`,
        clientActions: [
          {
            type: 'layer.update_style',
            layerId: input.layerId,
            style: input.style
          }
        ]
      })
    }
  })
}
