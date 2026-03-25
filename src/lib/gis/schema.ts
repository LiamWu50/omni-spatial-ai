import { z } from 'zod'

export const engineTypeSchema = z.enum(['mapbox', 'cesium', 'leaflet'])
export type EngineType = z.infer<typeof engineTypeSchema>

export const lngLatSchema = z.object({
  lng: z.number(),
  lat: z.number()
})
export type LngLat = z.infer<typeof lngLatSchema>

export const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()])
export type BBox = z.infer<typeof bboxSchema>

export const mapViewStateSchema = z.object({
  center: lngLatSchema.default({ lng: 116.397389, lat: 39.908722 }),
  zoom: z.number().default(10),
  bearing: z.number().default(0),
  pitch: z.number().default(0),
  altitude: z.number().optional(),
  bounds: bboxSchema.optional(),
  projection: z.string().optional()
})
export type MapViewState = z.infer<typeof mapViewStateSchema>

export const baseMapDescriptorSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.enum(['mapbox', 'tianditu', 'osm', 'custom']),
  styleUrl: z.string().optional(),
  imageryUrl: z.string().optional(),
  note: z.string().optional()
})
export type BaseMapDescriptor = z.infer<typeof baseMapDescriptorSchema>

export const geoJsonFeatureSchema = z.object({
  type: z.literal('Feature'),
  properties: z.record(z.any()).default({}),
  geometry: z.object({
    type: z.string(),
    coordinates: z.any()
  })
})

export const geoJsonFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(geoJsonFeatureSchema)
})
export type GeoJsonFeatureCollection = z.infer<typeof geoJsonFeatureCollectionSchema>

export const layerStyleSchema = z.object({
  color: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  lineWidth: z.number().optional(),
  radius: z.number().optional(),
  extruded: z.boolean().optional()
})
export type LayerStyle = z.infer<typeof layerStyleSchema>

export const layerDescriptorSchema = z.object({
  id: z.string(),
  name: z.string(),
  sourceType: z.enum(['geojson', 'geojson-url', 'vector', 'raster', 'table']),
  data: z.any(),
  geometryType: z.enum(['point', 'line', 'polygon', 'mixed']).default('mixed'),
  visible: z.boolean().default(true),
  style: layerStyleSchema.default({}),
  crs: z.string().default('WGS84')
})
export type LayerDescriptor = z.infer<typeof layerDescriptorSchema>

export const featureQuerySchema = z.object({
  layerId: z.string(),
  property: z.string().optional(),
  value: z.any().optional(),
  limit: z.number().int().positive().optional()
})
export type FeatureQuery = z.infer<typeof featureQuerySchema>

export const fitOptionsSchema = z.object({
  padding: z.number().default(32),
  duration: z.number().default(800)
})
export type FitOptions = z.infer<typeof fitOptionsSchema>

export const actionMetaSchema = z.object({
  requestId: z.string().optional(),
  schemaVersion: z.string().default('1.0.0'),
  source: z.enum(['ui', 'ai', 'system', 'analysis']).default('system'),
  replayable: z.boolean().default(true),
  timestamp: z.string().optional()
})
export type ActionMeta = z.infer<typeof actionMetaSchema>
export type ActionSource = ActionMeta['source']

const moveToActionSchema = z.object({
  type: z.literal('MOVE_TO'),
  payload: z.object({
    center: lngLatSchema,
    zoom: z.number().optional(),
    pitch: z.number().optional(),
    bearing: z.number().optional()
  }),
  meta: actionMetaSchema.default({})
})

const setZoomActionSchema = z.object({
  type: z.literal('SET_ZOOM'),
  payload: z.object({
    zoom: z.number()
  }),
  meta: actionMetaSchema.default({})
})

const fitBoundsActionSchema = z.object({
  type: z.literal('FIT_BOUNDS'),
  payload: z.object({
    bounds: bboxSchema,
    options: fitOptionsSchema.optional()
  }),
  meta: actionMetaSchema.default({})
})

const switchBaseMapActionSchema = z.object({
  type: z.literal('SWITCH_BASEMAP'),
  payload: z.object({
    baseMap: baseMapDescriptorSchema
  }),
  meta: actionMetaSchema.default({})
})

const addLayerActionSchema = z.object({
  type: z.literal('ADD_LAYER'),
  payload: z.object({
    layer: layerDescriptorSchema
  }),
  meta: actionMetaSchema.default({})
})

const updateLayerActionSchema = z.object({
  type: z.literal('SET_LAYER_STYLE'),
  payload: z.object({
    layerId: z.string(),
    style: layerStyleSchema
  }),
  meta: actionMetaSchema.default({})
})

const removeLayerActionSchema = z.object({
  type: z.literal('REMOVE_LAYER'),
  payload: z.object({
    layerId: z.string()
  }),
  meta: actionMetaSchema.default({})
})

const queryLayerActionSchema = z.object({
  type: z.literal('QUERY_LAYER'),
  payload: z.object({
    query: featureQuerySchema
  }),
  meta: actionMetaSchema.default({})
})

const calcBufferActionSchema = z.object({
  type: z.literal('CALC_BUFFER'),
  payload: z.object({
    layerId: z.string(),
    distance: z.number().positive(),
    units: z.enum(['meters', 'kilometers']).default('meters'),
    targetLayerId: z.string().optional()
  }),
  meta: actionMetaSchema.default({})
})

export const gisActionSchema = z.discriminatedUnion('type', [
  moveToActionSchema,
  setZoomActionSchema,
  fitBoundsActionSchema,
  switchBaseMapActionSchema,
  addLayerActionSchema,
  updateLayerActionSchema,
  removeLayerActionSchema,
  queryLayerActionSchema,
  calcBufferActionSchema
])
export type GisAction = z.infer<typeof gisActionSchema>

export const analysisRequestSchema = z.object({
  action: z.enum(['buffer', 'query']),
  layer: layerDescriptorSchema,
  distance: z.number().positive().optional(),
  units: z.enum(['meters', 'kilometers']).optional(),
  filter: z.record(z.any()).optional()
})
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>

export const analysisResultSchema = z.object({
  summary: z.string(),
  outputLayer: layerDescriptorSchema.optional(),
  table: z.array(z.record(z.any())).optional()
})
export type AnalysisResult = z.infer<typeof analysisResultSchema>

export type Unsubscribe = () => void

export function createActionMeta(source: ActionSource): ActionMeta {
  return {
    source,
    schemaVersion: '1.0.0',
    replayable: true,
    timestamp: new Date().toISOString()
  }
}

export function parseGisAction(input: unknown): GisAction {
  return gisActionSchema.parse(input)
}

export function parseGisActions(input: unknown): GisAction[] {
  return z.array(gisActionSchema).parse(input)
}

export function defaultBaseMaps(): Record<string, BaseMapDescriptor> {
  return {
    streets: {
      id: 'streets',
      name: 'Mapbox Streets',
      provider: 'mapbox'
    },
    imagery: {
      id: 'imagery',
      name: '天地图影像',
      provider: 'tianditu'
    },
    light: {
      id: 'light',
      name: 'OpenStreetMap Light',
      provider: 'osm'
    }
  }
}
