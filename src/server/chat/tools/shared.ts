import { z } from 'zod'

import { USER_LAYER_ID_PREFIX } from '@/features/map/lib/constants'
import { extractBounds, extractGeometryType } from '@/features/map/lib/user-layers'
import { type GeoJsonFeatureCollection, geoJsonFeatureCollectionSchema, type LayerDescriptor } from '@/lib/gis/schema'

/**
 * 地理编码结果。
 */
export interface GeocodeResult {
  lng: number
  lat: number
  label?: string
}

/**
 * 地理编码适配器接口。
 */
export interface GeocoderAdapter {
  geocode(query: string): Promise<GeocodeResult | null>
}

/**
 * 系统数据集加载器接口。
 */
export interface SystemDatasetLoader {
  load(datasetId: string): Promise<LayerDescriptor | null>
}

/**
 * 地图助手工具创建参数。
 */
export interface CreateMapAssistantToolsOptions {
  fetch?: typeof fetch
  geocoder?: GeocoderAdapter
  systemDatasetLoader?: SystemDatasetLoader
}

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

/**
 * 读取 JSON 环境变量并解析。
 */
export function readJsonEnv<T>(name: string): T | null {
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

/**
 * 根据点路径读取嵌套值。
 */
export function readPathValue(input: unknown, path: string | undefined) {
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

/**
 * 转换为有限数字。
 */
export function asFiniteNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/**
 * 规范化图层名片段。
 */
export function sanitizeLayerKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

/**
 * 基于名称生成图层 ID。
 */
export function createLayerId(name: string) {
  const key = sanitizeLayerKey(name) || 'map-layer'
  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${USER_LAYER_ID_PREFIX}${key}-${suffix}`
}

/**
 * 从 URL 推断图层名称。
 */
export function inferLayerNameFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    const pathname = parsedUrl.pathname.split('/').filter(Boolean).pop()
    return pathname ? decodeURIComponent(pathname) : parsedUrl.hostname
  } catch {
    return '远程 GeoJSON 图层'
  }
}

/**
 * 规范化 GeoJSON 图层数据。
 */
export function normalizeGeoJsonLayer(options: {
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

/**
 * 从远程 URL 拉取 GeoJSON FeatureCollection。
 */
export async function fetchGeoJsonFromUrl(fetchImpl: typeof fetch, url: string) {
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

/**
 * 创建内置的 LocationIQ 地理编码配置。
 */
export function createLocationIqGeocoderConfig() {
  const apiKey = process.env.LOCATIONIQ_API_KEY
  if (!apiKey) {
    return null
  }

  return {
    urlTemplate: `https://us1.locationiq.com/v1/search?key=${encodeURIComponent(apiKey)}&q={query}&format=json&limit=1`,
    lngPath: 'lon',
    latPath: 'lat',
    labelPath: 'display_name'
  } satisfies z.infer<typeof geocoderConfigSchema>
}

/**
 * 创建默认地理编码器。
 */
export function createDefaultGeocoder(fetchImpl: typeof fetch): GeocoderAdapter {
  return {
    async geocode(query) {
      const rawConfig = readJsonEnv<unknown>('MAP_GEOCODER_CONFIG')
      const configCandidate = rawConfig ?? createLocationIqGeocoderConfig()

      if (!configCandidate) {
        throw new Error(
          '当前未配置地理编码服务，请配置 `MAP_GEOCODER_CONFIG` 或 `LOCATIONIQ_API_KEY`，或者直接提供经纬度坐标。'
        )
      }
      const parsedConfig = geocoderConfigSchema.safeParse(configCandidate)
      if (!parsedConfig.success) {
        throw new Error('地理编码配置缺少必要字段')
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
      const resultCandidate = config.resultPath
        ? readPathValue(payload, config.resultPath)
        : Array.isArray(payload)
          ? payload[0]
          : payload
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

/**
 * 创建默认系统数据集加载器。
 */
export function createDefaultSystemDatasetLoader(fetchImpl: typeof fetch): SystemDatasetLoader {
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
          name:
            typeof entry.name === 'string' && entry.name.trim().length > 0
              ? entry.name
              : inferLayerNameFromUrl(entry.url)
        })
      }
      if (entry.type === 'geojson') {
        const layerName = typeof entry.name === 'string' && entry.name.trim().length > 0 ? entry.name : datasetId
        return normalizeGeoJsonLayer({
          collection: entry.data,
          name: layerName
        })
      }
      throw new Error(`系统数据集 ${datasetId} 配置无效`)
    }
  }
}
