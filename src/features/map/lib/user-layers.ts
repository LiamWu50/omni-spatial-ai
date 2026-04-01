import type { Feature, Geometry, Position } from 'geojson'
import type { Layer } from 'leaflet'

import type { BBox, GeoJsonFeatureCollection, LayerDescriptor } from '@/lib/gis/schema'
import { geoJsonFeatureCollectionSchema } from '@/lib/gis/schema'

import type { LayerOrigin, UserLayerListItem } from '../types'
import {
  DRAW_LAYER_ID_PREFIX,
  LAYER_UPLOAD_MAX_SIZE_MB,
  MEASURE_LAYER_ID_PREFIX,
  USER_LAYER_ID_PREFIX
} from './constants'

const DRAW_LAYER_STYLE: LayerDescriptor['style'] = {
  color: '#8b5cf6',
  opacity: 0.92,
  lineWidth: 3,
  radius: 6
}

const MEASURE_LAYER_STYLE: LayerDescriptor['style'] = {
  color: '#f59e0b',
  opacity: 0.9,
  lineWidth: 3,
  radius: 5
}

const USER_LAYER_STYLE: LayerDescriptor['style'] = {
  color: '#38bdf8',
  opacity: 0.85,
  lineWidth: 2,
  radius: 6
}

const INTERNAL_META_KEYS = {
  kind: '__managedKind',
  origin: '__managedOrigin',
  measureLabel: '__managedMeasureLabel'
} as const

type GeometryCategory = Exclude<LayerDescriptor['geometryType'], 'mixed'>

export interface MeasurementResult {
  area: number
  areaDisplay: string
  length: number
  lengthDisplay: string
  pointCount: number
  points: Position[]
}

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

function formatSequence(sequence: number) {
  return sequence.toString().padStart(2, '0')
}

function withBounds(collection: GeoJsonFeatureCollection) {
  const bounds = extractBounds(collection)

  return {
    data: {
      ...collection,
      ...(bounds ? { bbox: bounds } : {})
    },
    bounds
  }
}

function withMeta(
  collection: GeoJsonFeatureCollection,
  meta: {
    kind: string
    origin: LayerOrigin
    measureLabel?: string | null
  }
): GeoJsonFeatureCollection {
  return {
    ...collection,
    features: collection.features.map((feature, index) => ({
      ...feature,
      properties: {
        ...feature.properties,
        ...(index === 0
          ? {
              [INTERNAL_META_KEYS.kind]: meta.kind,
              [INTERNAL_META_KEYS.origin]: meta.origin,
              ...(meta.measureLabel ? { [INTERNAL_META_KEYS.measureLabel]: meta.measureLabel } : {})
            }
          : {})
      }
    }))
  }
}

export function extractBounds(collection: GeoJsonFeatureCollection): BBox | null {
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

export function extractGeometryType(collection: GeoJsonFeatureCollection): LayerDescriptor['geometryType'] {
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

export function extractBoundsFromLayer(layer: LayerDescriptor) {
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

export function extractFeatureCount(layer: LayerDescriptor) {
  const parsed = geoJsonFeatureCollectionSchema.safeParse(layer.data)
  return parsed.success ? parsed.data.features.length : 0
}

function createUserLayerId(fileName: string, uniqueToken: string) {
  return `${USER_LAYER_ID_PREFIX}${normalizeFileBasename(fileName)}-${uniqueToken}`
}

function createDrawLayerId(kind: string, uniqueToken: string) {
  return `${DRAW_LAYER_ID_PREFIX}${kind}-${uniqueToken}`
}

function createMeasureLayerId(kind: string, uniqueToken: string) {
  return `${MEASURE_LAYER_ID_PREFIX}${kind}-${uniqueToken}`
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

function asFeatureCollection(feature: Feature) {
  const normalizedFeature = {
    ...feature,
    properties: feature.properties ?? {}
  }

  return {
    type: 'FeatureCollection',
    features: [normalizedFeature]
  } as GeoJsonFeatureCollection
}

function closeRing(points: Position[]) {
  if (points.length === 0) {
    return points
  }

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
    return points
  }

  return [...points, [firstPoint[0], firstPoint[1]]]
}

function readFeatureCollection(layer: LayerDescriptor) {
  const parsed = geoJsonFeatureCollectionSchema.safeParse(layer.data)
  return parsed.success ? parsed.data : null
}

function readLayerMetaValue(layer: LayerDescriptor, key: string) {
  const collection = readFeatureCollection(layer)
  return collection?.features[0]?.properties?.[key]
}

function geometryKindLabel(kind: LayerDescriptor['geometryType']) {
  if (kind === 'point') {
    return '点位'
  }

  if (kind === 'line') {
    return '线段'
  }

  if (kind === 'polygon') {
    return '多边形'
  }

  return '图形'
}

export function getLayerOrigin(layer: LayerDescriptor): LayerOrigin | null {
  if (layer.id.startsWith(USER_LAYER_ID_PREFIX)) {
    return 'upload'
  }

  if (layer.id.startsWith(MEASURE_LAYER_ID_PREFIX)) {
    return 'measure'
  }

  if (layer.id.startsWith(DRAW_LAYER_ID_PREFIX)) {
    return 'draw'
  }

  return null
}

export function isUserUploadedLayer(layer: LayerDescriptor) {
  return getLayerOrigin(layer) === 'upload'
}

export function isMeasureLayer(layer: LayerDescriptor) {
  return getLayerOrigin(layer) === 'measure'
}

export function isDrawLayer(layer: LayerDescriptor) {
  return getLayerOrigin(layer) === 'draw'
}

export function isManagedLayer(layer: LayerDescriptor) {
  return getLayerOrigin(layer) !== null
}

export function isToolManagedLayer(layer: LayerDescriptor) {
  const origin = getLayerOrigin(layer)
  return origin === 'draw' || origin === 'measure'
}

export function getLayerMeasureLabel(layer: LayerDescriptor) {
  const measureLabel = readLayerMetaValue(layer, INTERNAL_META_KEYS.measureLabel)
  return typeof measureLabel === 'string' && measureLabel.trim().length > 0 ? measureLabel : null
}

export function getLayerKind(layer: LayerDescriptor) {
  const kind = readLayerMetaValue(layer, INTERNAL_META_KEYS.kind)
  return typeof kind === 'string' && kind.trim().length > 0 ? kind : null
}

export function toUserLayerListItem(layer: LayerDescriptor): UserLayerListItem {
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    featureCount: extractFeatureCount(layer),
    sourceType: layer.sourceType,
    geometryType: layer.geometryType,
    bounds: extractBoundsFromLayer(layer),
    origin: getLayerOrigin(layer) ?? 'upload'
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

  const collection = withMeta(parsedCollection.data, {
    kind: 'upload',
    origin: 'upload'
  })
  const { data } = withBounds(collection)

  return {
    id: createUserLayerId(file.name, uniqueToken),
    name: file.name,
    sourceType: 'geojson',
    data,
    geometryType: extractGeometryType(collection),
    visible: true,
    style: USER_LAYER_STYLE,
    crs: 'WGS84'
  }
}

export function createDrawLayerFromFeature(options: {
  feature: Feature<Geometry>
  sequence: number
  uniqueToken: string
}): LayerDescriptor {
  const collection = withMeta(asFeatureCollection(options.feature), {
    kind: geometryKindLabel(geometryToCategory(options.feature.geometry.type)),
    origin: 'draw'
  })
  const geometryType = extractGeometryType(collection)
  const { data } = withBounds(collection)
  const kindLabel = geometryKindLabel(geometryType)

  return {
    id: createDrawLayerId(geometryType, options.uniqueToken),
    name: `${kindLabel} ${formatSequence(options.sequence)}`,
    sourceType: 'geojson',
    data,
    geometryType,
    visible: true,
    style: DRAW_LAYER_STYLE,
    crs: 'WGS84'
  }
}

export function createMeasureLayerFromResult(options: {
  result: MeasurementResult
  sequence: number
  uniqueToken: string
}): LayerDescriptor | null {
  const coordinates = options.result.points
  if (coordinates.length === 0) {
    return null
  }

  const isAreaMeasurement = options.result.area > 0 && coordinates.length >= 3
  const polygonCoordinates = isAreaMeasurement ? closeRing(coordinates) : coordinates
  const geometry: Geometry = isAreaMeasurement
    ? {
        type: 'Polygon',
        coordinates: [polygonCoordinates]
      }
    : coordinates.length >= 2
      ? {
          type: 'LineString',
          coordinates
        }
      : {
          type: 'Point',
          coordinates: coordinates[0]
        }

  const measureLabel = isAreaMeasurement
    ? `面积 ${options.result.areaDisplay} · 周长 ${options.result.lengthDisplay}`
    : `距离 ${options.result.lengthDisplay}`
  const kindLabel = isAreaMeasurement ? '面积测量' : '距离测量'

  const collection = withMeta(
    asFeatureCollection({
      type: 'Feature',
      properties: {},
      geometry
    } as Feature),
    {
      kind: kindLabel,
      origin: 'measure',
      measureLabel
    }
  )
  const geometryType = extractGeometryType(collection)
  const { data } = withBounds(collection)

  return {
    id: createMeasureLayerId(isAreaMeasurement ? 'area' : 'distance', options.uniqueToken),
    name: `${kindLabel} ${formatSequence(options.sequence)}`,
    sourceType: 'geojson',
    data,
    geometryType,
    visible: true,
    style: MEASURE_LAYER_STYLE,
    crs: 'WGS84'
  }
}

export function toLeafletFeature(layer: LayerDescriptor) {
  const collection = readFeatureCollection(layer)
  const feature = collection?.features[0]

  if (!feature) {
    return null
  }

  return feature
}

export function buildDrawMarkerIconHtml() {
  return '<span class="map-draw-marker-dot"></span>'
}

export function readManagedOriginFromFeature(layer: LayerDescriptor) {
  const origin = readLayerMetaValue(layer, INTERNAL_META_KEYS.origin)
  return origin === 'upload' || origin === 'measure' || origin === 'draw' ? origin : getLayerOrigin(layer)
}

export function layerToGeoJsonData(layer: Layer) {
  if (!('toGeoJSON' in layer) || typeof layer.toGeoJSON !== 'function') {
    return null
  }

  const geoJson = layer.toGeoJSON() as Feature<Geometry> | GeoJsonFeatureCollection

  if ('type' in geoJson && geoJson.type === 'FeatureCollection') {
    return geoJson
  }

  return asFeatureCollection(geoJson)
}
