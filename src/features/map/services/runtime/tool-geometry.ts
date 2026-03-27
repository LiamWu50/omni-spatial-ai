import type { Feature, Geometry, Position } from 'geojson'
import type { LatLng } from 'leaflet'

export interface MeasureMetrics {
  area: number
  areaDisplay: string
  length: number
  lengthDisplay: string
  pointCount: number
  points: Position[]
}

export type PathGeometryType = 'line' | 'polygon'

const EARTH_RADIUS = 6378137

function formatNumber(value: number, digits: number) {
  if (digits === 0) {
    return Math.round(value).toString()
  }

  return value
    .toFixed(digits)
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
}

function clonePoint(point: LatLng) {
  return [point.lng, point.lat] as Position
}

export function closePath(points: LatLng[]) {
  if (points.length === 0) {
    return []
  }

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  if (firstPoint.lat === lastPoint.lat && firstPoint.lng === lastPoint.lng) {
    return points.map(clonePoint)
  }

  return [...points.map(clonePoint), clonePoint(firstPoint)]
}

export function isClosedPath(points: LatLng[], project: (point: LatLng) => { x: number; y: number }, tolerancePx = 12) {
  if (points.length < 3) {
    return false
  }

  const firstPoint = project(points[0])
  const lastPoint = project(points[points.length - 1])
  const deltaX = firstPoint.x - lastPoint.x
  const deltaY = firstPoint.y - lastPoint.y

  return Math.hypot(deltaX, deltaY) <= tolerancePx
}

export function getPathGeometryType(points: LatLng[], closed: boolean): PathGeometryType | null {
  if (points.length < 2) {
    return null
  }

  return closed && points.length >= 3 ? 'polygon' : 'line'
}

export function buildFeatureFromPath(points: LatLng[], geometryType: PathGeometryType): Feature<Geometry> {
  const coordinates = points.map((point) => [point.lng, point.lat] as Position)

  return geometryType === 'polygon'
    ? {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [closeRing(coordinates)]
        }
      }
    : {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
}

export function buildPointFeature(point: LatLng): Feature<Geometry> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [point.lng, point.lat]
    }
  }
}

export function formatLength(lengthMeters: number) {
  if (lengthMeters >= 1000) {
    return `${formatNumber(lengthMeters / 1000, 2)} 千米`
  }

  return `${formatNumber(lengthMeters, 0)} 米`
}

export function formatArea(areaSquareMeters: number) {
  if (areaSquareMeters >= 10000) {
    return `${formatNumber(areaSquareMeters / 10000, 2)} 公顷`
  }

  return `${formatNumber(areaSquareMeters, 0)} 平方米`
}

export function calculatePathLength(points: LatLng[], closeLoop = false) {
  if (points.length < 2) {
    return 0
  }

  let length = 0

  for (let index = 1; index < points.length; index += 1) {
    length += points[index - 1].distanceTo(points[index])
  }

  if (closeLoop) {
    length += points[points.length - 1].distanceTo(points[0])
  }

  return length
}

export function calculatePolygonArea(points: LatLng[]) {
  if (points.length < 3) {
    return 0
  }

  let area = 0

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % points.length]
    const currentLat = toRadians(current.lat)
    const nextLat = toRadians(next.lat)
    const deltaLng = toRadians(next.lng - current.lng)

    area += deltaLng * (2 + Math.sin(currentLat) + Math.sin(nextLat))
  }

  return Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2)
}

export function buildMeasureMetrics(points: LatLng[], closed: boolean): MeasureMetrics | null {
  const geometryType = getPathGeometryType(points, closed)

  if (!geometryType) {
    return null
  }

  const normalizedPoints = geometryType === 'polygon' ? closePath(points) : points.map(clonePoint)
  const length = calculatePathLength(points, geometryType === 'polygon')
  const area = geometryType === 'polygon' ? calculatePolygonArea(points) : 0

  return {
    area,
    areaDisplay: geometryType === 'polygon' ? formatArea(area) : '0 平方米',
    length,
    lengthDisplay: formatLength(length),
    pointCount: normalizedPoints.length,
    points: normalizedPoints
  }
}

function closeRing(points: Position[]) {
  if (points.length === 0) {
    return []
  }

  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  if (firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]) {
    return points
  }

  return [...points, [firstPoint[0], firstPoint[1]]]
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}
