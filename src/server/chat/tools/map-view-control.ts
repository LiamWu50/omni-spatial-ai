import { tool } from 'ai'

import {
  type MapViewControlInput,
  mapAssistantToolDescriptions,
  mapViewControlInputSchema,
  type ToolExecutionResult,
  toolExecutionResultSchema
} from '@/features/assistant/lib/contracts'

import type { GeocodeResult, GeocoderAdapter } from './shared'

const DEFAULT_FLY_TO_ZOOM = 11

function buildToolResult(result: ToolExecutionResult) {
  return toolExecutionResultSchema.parse(result)
}

/**
 * 创建地图视角控制工具。
 */
export function createMapViewControlTool(geocoder: GeocoderAdapter) {
  return tool<MapViewControlInput, ToolExecutionResult>({
    description: mapAssistantToolDescriptions.map_view_control,
    inputSchema: mapViewControlInputSchema,
    async execute(input) {
      if (input.action === 'reset_view') {
        return buildToolResult({
          ok: true,
          message: '已准备回到地图初始视角。',
          clientActions: [{ type: 'view.reset' }]
        })
      }
      if (input.action === 'locate_user') {
        return buildToolResult({
          ok: true,
          message: '已准备定位到用户当前位置。',
          clientActions: [{ type: 'view.locate_user' }]
        })
      }
      if (input.target.type === 'coordinates') {
        return buildToolResult({
          ok: true,
          message: `已准备飞到坐标 ${input.target.lng}, ${input.target.lat}。`,
          clientActions: [
            {
              type: 'view.fly_to',
              center: {
                lng: input.target.lng,
                lat: input.target.lat
              },
              zoom: input.target.zoom ?? DEFAULT_FLY_TO_ZOOM
            }
          ]
        })
      }
      let location: GeocodeResult | null
      try {
        location = await geocoder.geocode(input.target.query)
      } catch (error) {
        return buildToolResult({
          ok: false,
          message: error instanceof Error ? error.message : '地点解析失败'
        })
      }
      if (!location) {
        return buildToolResult({
          ok: false,
          message: `未找到地点“${input.target.query}”，请补充更具体的位置或直接提供经纬度。`
        })
      }
      return buildToolResult({
        ok: true,
        message: `已解析地点“${location.label ?? input.target.query}”，准备调整地图视角。`,
        clientActions: [
          {
            type: 'view.fly_to',
            center: {
              lng: location.lng,
              lat: location.lat
            },
            zoom: input.target.zoom ?? DEFAULT_FLY_TO_ZOOM
          }
        ]
      })
    }
  })
}
