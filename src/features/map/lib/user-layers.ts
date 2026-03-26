import type { BBox, GeoJsonFeatureCollection, LayerDescriptor } from '@/lib/gis/schema'
import { geoJsonFeatureCollectionSchema } from '@/lib/gis/schema'

import type { UserLayerListItem } from '../types'
import { LAYER_UPLOAD_MAX_SIZE_MB, USER_LAYER_ID_PREFIX } from './constants'

const USER_LAYER_STYLE: LayerDescriptor['style'] = {
  color: '#38bdf8',
  opacity: 0.85,
  lineWidth: 2,
  radius: 6
}

type GeometryCategory = Exclude<LayerDescriptor['geometryType'], 'mixed'>

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    Number.isFinite(value[0]) &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[1])
  )
}

function collectCoordinates(input: unknown, accumulator: Array<[number, number]>) {
  if (isCoordinatePair(input)) {
    accumulator.push([input[0], input[1]])
    return
  }

  if (!Array.isArray(input)) {
    return
  }

  for (const item of input) {
    collectCoordinates(item, accumulator)
  }
}

function geometryToCategory(type: string): LayerDescriptor['geometryType'] {
  if (type === 'Point' || type === 'MultiPoint') {
    return 'point'
  }

  if (type === 'LineString' || type === 'MultiLineString') {
    return 'line'
  }

  if (type === 'Polygon' || type === 'MultiPolygon') {
    return 'polygon'
  }

  return 'mixed'
}

function normalizeFileBasename(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '')

  return (
    baseName
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'layer'
  )
}

function extractBounds(collection: GeoJsonFeatureCollection): BBox | null {
  const coordinates: Array<[number, number]> = []

  for (const feature of collection.features) {
    collectCoordinates(feature.geometry.coordinates, coordinates)
  }

  if (coordinates.length === 0) {
    return null
  }

  const lngs = coordinates.map(([lng]) => lng)
  const lats = coordinates.map(([, lat]) => lat)

  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)]
}

function extractGeometryType(collection: GeoJsonFeatureCollection): LayerDescriptor['geometryType'] {
  const categories = new Set<GeometryCategory>()

  for (const feature of collection.features) {
    const category = geometryToCategory(feature.geometry.type)

    if (category === 'mixed') {
      return 'mixed'
    }

    categories.add(category)
  }

  if (categories.size === 1) {
    return [...categories][0]
  }

  return 'mixed'
}

function extractBoundsFromLayer(layer: LayerDescriptor) {
  const data = layer.data as { bbox?: unknown }

  if (
    Array.isArray(data?.bbox) &&
    data.bbox.length === 4 &&
    data.bbox.every((value) => typeof value === 'number' && Number.isFinite(value))
  ) {
    return data.bbox as BBox
  }

  const parsed = geoJsonFeatureCollectionSchema.safeParse(layer.data)
  if (!parsed.success) {
    return null
  }

  return extractBounds(parsed.data)
}

function extractFeatureCount(layer: LayerDescriptor) {
  const parsed = geoJsonFeatureCollectionSchema.safeParse(layer.data)
  return parsed.success ? parsed.data.features.length : 0
}

function createUserLayerId(fileName: string, uniqueToken: string) {
  return `${USER_LAYER_ID_PREFIX}${normalizeFileBasename(fileName)}-${uniqueToken}`
}

function ensureGeoJsonFile(file: File) {
  const lowerName = file.name.toLowerCase()

  if (!lowerName.endsWith('.geojson') && !lowerName.endsWith('.json')) {
    throw new Error('仅支持 GeoJSON / JSON 文件')
  }

  if (file.size > LAYER_UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`文件大小不能超过 ${LAYER_UPLOAD_MAX_SIZE_MB} MB`)
  }
}

export async function parseUserLayerFile(file: File, uniqueToken: string): Promise<LayerDescriptor> {
  ensureGeoJsonFile(file)

  const rawText = await file.text()
  let parsedJson: unknown

  try {
    parsedJson = JSON.parse(rawText)
  } catch {
    throw new Error('文件内容不是合法 JSON')
  }

  const parsedCollection = geoJsonFeatureCollectionSchema.safeParse(parsedJson)
  if (!parsedCollection.success) {
    throw new Error('仅支持 GeoJSON FeatureCollection')
  }

  if (parsedCollection.data.features.length === 0) {
    throw new Error('无有效要素')
  }

  const bounds = extractBounds(parsedCollection.data)

  return {
    id: createUserLayerId(file.name, uniqueToken),
    name: file.name,
    sourceType: 'geojson',
    data: {
      ...parsedCollection.data,
      ...(bounds ? { bbox: bounds } : {})
    },
    geometryType: extractGeometryType(parsedCollection.data),
    visible: true,
    style: USER_LAYER_STYLE,
    crs: 'WGS84'
  }
}

export function isUserUploadedLayer(layer: LayerDescriptor) {
  return layer.id.startsWith(USER_LAYER_ID_PREFIX)
}

export function toUserLayerListItem(layer: LayerDescriptor): UserLayerListItem {
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    featureCount: extractFeatureCount(layer),
    sourceType: layer.sourceType,
    geometryType: layer.geometryType,
    bounds: extractBoundsFromLayer(layer)
  }
}
