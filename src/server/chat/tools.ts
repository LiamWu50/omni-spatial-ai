import { tool } from 'ai'
import { z } from 'zod'

import { geoJsonFeatureCollectionSchema, type GeoJsonFeatureCollection, type LayerDescriptor } from '@/lib/gis/schema'
import { USER_LAYER_ID_PREFIX } from '@/features/map/lib/constants'
import { extractBounds, extractGeometryType } from '@/features/map/lib/user-layers'
import {
  mapAssistantToolDescriptions,
  mapLayerLoadInputSchema,
  mapLayerStyleInputSchema,
  mapViewControlInputSchema,
  toolExecutionResultSchema,
  type MapLayerLoadInput,
  type MapLayerStyleInput,
  type MapViewControlInput,
  type MapClientAction,
  type ToolExecutionResult
} from '@/features/assistant/lib/contracts'

interface GeocodeResult {
  lng: number
  lat: number
  label?: string
}

export interface GeocoderAdapter {
  geocode(query: string): Promise<GeocodeResult | null>
}

export interface SystemDatasetLoader {
  load(datasetId: string): Promise<LayerDescriptor | null>
}

interface CreateMapAssistantToolsOptions {
  fetch?: typeof fetch
  geocoder?: GeocoderAdapter
  systemDatasetLoader?: SystemDatasetLoader
}

const DEFAULT_FLY_TO_ZOOM = 11

const geocoderConfigSchema = z.object({
  urlTemplate: z.string().min(1),
  resultPath: z.string().optional(),
  lngPath: z.string().min(1),
  latPath: z.string().min(1),
  labelPath: z.string().optional(),
  headers: z.record(z.string()).optional()
})

const systemDatasetDefinitionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('url'),
    url: z.string().url(),
    name: z.string().trim().min(1).optional(),
    format: z.literal('geojson').default('geojson')
  }),
  z.object({
    type: z.literal('geojson'),
    name: z.string().trim().min(1).optional(),
    data: geoJsonFeatureCollectionSchema
  })
])

const systemDatasetRegistrySchema = z.record(systemDatasetDefinitionSchema)

function readJsonEnv<T>(name: string): T | null {
  const rawValue = process.env[name]

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    throw new Error(`环境变量 ${name} 不是合法 JSON`)
  }
}

function readPathValue(input: unknown, path: string | undefined) {
  if (!path || path.trim().length === 0) {
    return input
  }

  return path
    .split('.')
    .filter((segment) => segment.length > 0)
    .reduce<unknown>((current, segment) => {
      if (current == null) {
        return undefined
      }

      if (Array.isArray(current)) {
        const index = Number(segment)
        return Number.isInteger(index) ? current[index] : undefined
      }

      if (typeof current === 'object') {
        return (current as Record<string, unknown>)[segment]
      }

      return undefined
    }, input)
}

function asFiniteNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function sanitizeLayerKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function createLayerId(name: string) {
  const key = sanitizeLayerKey(name) || 'map-layer'
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)

  return `${USER_LAYER_ID_PREFIX}${key}-${suffix}`
}

function inferLayerNameFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname.split('/').filter(Boolean).pop()
    return pathname ? decodeURIComponent(pathname) : parsedUrl.hostname
  } catch {
    return '远程 GeoJSON 图层'
  }
}

function normalizeGeoJsonLayer(options: {
  collection: GeoJsonFeatureCollection
  name: string
}): LayerDescriptor {
  const parsed = geoJsonFeatureCollectionSchema.safeParse(options.collection)

  if (!parsed.success) {
    throw new Error('仅支持 GeoJSON FeatureCollection')
  }

  if (parsed.data.features.length === 0) {
    throw new Error('无有效要素')
  }

  const bounds = extractBounds(parsed.data)
  const data = bounds ? { ...parsed.data, bbox: bounds } : parsed.data

  return {
    id: createLayerId(options.name),
    name: options.name,
    sourceType: 'geojson',
    data,
    geometryType: extractGeometryType(parsed.data),
    visible: true,
    style: {},
    crs: 'WGS84'
  }
}

async function fetchGeoJsonFromUrl(fetchImpl: typeof fetch, url: string) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: 'application/geo+json, application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`数据加载失败：HTTP ${response.status}`)
  }

  const parsedJson = (await response.json()) as unknown
  const parsedCollection = geoJsonFeatureCollectionSchema.safeParse(parsedJson)

  if (!parsedCollection.success) {
    throw new Error('远程数据不是合法 GeoJSON FeatureCollection')
  }

  return parsedCollection.data
}

function createDefaultGeocoder(fetchImpl: typeof fetch): GeocoderAdapter {
  return {
    async geocode(query) {
      const rawConfig = readJsonEnv<unknown>('MAP_GEOCODER_CONFIG')

      if (!rawConfig) {
        throw new Error('当前未配置地理编码服务，请提供经纬度坐标。')
      }

      const parsedConfig = geocoderConfigSchema.safeParse(rawConfig)

      if (!parsedConfig.success) {
        throw new Error('MAP_GEOCODER_CONFIG 缺少必要字段')
      }

      const config = parsedConfig.data

      const requestUrl = config.urlTemplate.replaceAll('{query}', encodeURIComponent(query))
      const response = await fetchImpl(requestUrl, {
        headers: config.headers
      })

      if (!response.ok) {
        throw new Error(`地理编码失败：HTTP ${response.status}`)
      }

      const payload = (await response.json()) as unknown
      const resultCandidate =
        readPathValue(payload, config.resultPath) ?? (Array.isArray(payload) ? payload[0] : payload)
      const lng = asFiniteNumber(readPathValue(resultCandidate, config.lngPath))
      const lat = asFiniteNumber(readPathValue(resultCandidate, config.latPath))

      if (lng == null || lat == null) {
        return null
      }

      const labelValue = readPathValue(resultCandidate, config.labelPath)
      return {
        lng,
        lat,
        label: typeof labelValue === 'string' ? labelValue : undefined
      }
    }
  }
}

function createDefaultSystemDatasetLoader(fetchImpl: typeof fetch): SystemDatasetLoader {
  return {
    async load(datasetId) {
      const rawRegistry = readJsonEnv<unknown>('MAP_SYSTEM_DATASETS')

      if (!rawRegistry) {
        return null
      }

      const parsedRegistry = systemDatasetRegistrySchema.safeParse(rawRegistry)

      if (!parsedRegistry.success) {
        throw new Error('MAP_SYSTEM_DATASETS 配置无效')
      }

      const entry = parsedRegistry.data[datasetId]

      if (!entry) {
        return null
      }

      if (entry.type === 'url' && typeof entry.url === 'string') {
        const collection = await fetchGeoJsonFromUrl(fetchImpl, entry.url)
        return normalizeGeoJsonLayer({
          collection,
          name: typeof entry.name === 'string' && entry.name.trim().length > 0 ? entry.name : inferLayerNameFromUrl(entry.url)
        })
      }

      if (entry.type === 'geojson') {
        const parsed = geoJsonFeatureCollectionSchema.safeParse(entry.data)
        if (!parsed.success) {
          throw new Error(`系统数据集 ${datasetId} 不是合法 GeoJSON`)
        }

        const layerName =
          typeof entry.name === 'string' && entry.name.trim().length > 0 ? entry.name : datasetId

        return normalizeGeoJsonLayer({
          collection: parsed.data,
          name: layerName
        })
      }

      throw new Error(`系统数据集 ${datasetId} 配置无效`)
    }
  }
}

function buildToolResult(result: ToolExecutionResult) {
  return toolExecutionResultSchema.parse(result)
}

export function createMapAssistantTools(options: CreateMapAssistantToolsOptions = {}) {
  const fetchImpl = options.fetch ?? fetch
  const geocoder = options.geocoder ?? createDefaultGeocoder(fetchImpl)
  const systemDatasetLoader = options.systemDatasetLoader ?? createDefaultSystemDatasetLoader(fetchImpl)

  return {
    map_view_control: tool<MapViewControlInput, ToolExecutionResult>({
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
    }),
    map_layer_load: tool<MapLayerLoadInput, ToolExecutionResult>({
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
    }),
    map_layer_style: tool<MapLayerStyleInput, ToolExecutionResult>({
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
}
