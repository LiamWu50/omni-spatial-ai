import type { UIMessage } from 'ai'
import { z } from 'zod'

import { bboxSchema, geoJsonFeatureCollectionSchema, layerDescriptorSchema, lngLatSchema } from '@/lib/gis/schema'

export const mapViewFlyToCoordinatesTargetSchema = z.object({
  type: z.literal('coordinates'),
  lng: z.number().describe('目标经度'),
  lat: z.number().describe('目标纬度'),
  zoom: z.number().optional().describe('可选目标缩放级别')
})

export const mapViewFlyToPlaceTargetSchema = z.object({
  type: z.literal('place'),
  query: z.string().min(1).describe('地点名称或地点描述'),
  zoom: z.number().optional().describe('可选目标缩放级别')
})

export const mapViewControlInputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('fly_to'),
    target: z.union([mapViewFlyToCoordinatesTargetSchema, mapViewFlyToPlaceTargetSchema])
  }),
  z.object({
    action: z.literal('reset_view')
  }),
  z.object({
    action: z.literal('locate_user')
  })
])

export const mapLayerLoadInputSchema = z.object({
  source: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('url'),
      url: z.string().url().describe('GeoJSON 数据地址'),
      format: z.literal('geojson').default('geojson')
    }),
    z.object({
      type: z.literal('system'),
      datasetId: z.string().min(1).describe('系统内数据集 ID')
    })
  ]),
  name: z.string().trim().min(1).optional().describe('可选图层名称'),
  fitToData: z.boolean().default(false).describe('加载后是否自动定位到数据范围')
})

export const mapLayerStylePatchSchema = z
  .object({
    color: z.string().optional().describe('主颜色，例如 #ef4444'),
    opacity: z.number().min(0).max(1).optional().describe('线或点透明度'),
    lineWidth: z.number().positive().optional().describe('线宽'),
    radius: z.number().positive().optional().describe('点半径'),
    fillColor: z.string().optional().describe('面填充颜色'),
    fillOpacity: z.number().min(0).max(1).optional().describe('面填充透明度'),
    visible: z.boolean().optional().describe('是否显示图层')
  })
  .refine((style) => Object.keys(style).length > 0, {
    message: '至少提供一个样式字段'
  })

export const mapLayerStyleInputSchema = z.object({
  layerId: z.string().min(1).describe('待更新图层 ID'),
  style: mapLayerStylePatchSchema
})

export const mapClientActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('view.fly_to'),
    center: lngLatSchema,
    zoom: z.number().optional()
  }),
  z.object({
    type: z.literal('view.fit_bounds'),
    bounds: bboxSchema
  }),
  z.object({
    type: z.literal('view.reset')
  }),
  z.object({
    type: z.literal('view.locate_user')
  }),
  z.object({
    type: z.literal('layer.add'),
    layer: layerDescriptorSchema
  }),
  z.object({
    type: z.literal('layer.update_style'),
    layerId: z.string(),
    style: mapLayerStylePatchSchema
  })
])

export const toolExecutionResultSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  clientActions: z.array(mapClientActionSchema).optional()
})

export const mapAssistantToolNameSchema = z.enum(['map_view_control', 'map_layer_load', 'map_layer_style'])

export const mapAssistantToolDescriptions = {
  map_view_control: '控制地图视角：飞到地点、回到初始视角、定位用户当前位置。',
  map_layer_load: '加载 GeoJSON 数据为地图图层，支持 URL 或系统内数据源。',
  map_layer_style: '修改已有图层的颜色、透明度、线宽、点半径、填充样式和显隐状态。'
} as const

export const mapAssistantToolMetadata = {
  map_view_control: {
    description: mapAssistantToolDescriptions.map_view_control,
    parameters: mapViewControlInputSchema
  },
  map_layer_load: {
    description: mapAssistantToolDescriptions.map_layer_load,
    parameters: mapLayerLoadInputSchema
  },
  map_layer_style: {
    description: mapAssistantToolDescriptions.map_layer_style,
    parameters: mapLayerStyleInputSchema
  }
} as const

export const mapClientActionDispatchSchema = z.object({
  toolCallId: z.string(),
  toolName: mapAssistantToolNameSchema,
  result: toolExecutionResultSchema
})

export const mapAssistantDataPartSchemas = {
  mapClientActions: mapClientActionDispatchSchema
} as const

export const mapAssistantToolSchemas = {
  map_view_control: {
    input: mapViewControlInputSchema,
    output: toolExecutionResultSchema
  },
  map_layer_load: {
    input: mapLayerLoadInputSchema,
    output: toolExecutionResultSchema
  },
  map_layer_style: {
    input: mapLayerStyleInputSchema,
    output: toolExecutionResultSchema
  }
} as const

export const geoJsonLayerPayloadSchema = z.object({
  name: z.string().min(1),
  data: geoJsonFeatureCollectionSchema
})

export type MapViewControlInput = z.infer<typeof mapViewControlInputSchema>
export type MapLayerLoadInput = z.infer<typeof mapLayerLoadInputSchema>
export type MapLayerStyleInput = z.infer<typeof mapLayerStyleInputSchema>
export type MapLayerStylePatch = z.infer<typeof mapLayerStylePatchSchema>
export type MapClientAction = z.infer<typeof mapClientActionSchema>
export type ToolExecutionResult = z.infer<typeof toolExecutionResultSchema>
export type MapAssistantToolName = z.infer<typeof mapAssistantToolNameSchema>
export type MapClientActionDispatch = z.infer<typeof mapClientActionDispatchSchema>

export type MapAssistantDataParts = Record<'mapClientActions', MapClientActionDispatch>

export type MapAssistantUIMessage = UIMessage<unknown, MapAssistantDataParts>
