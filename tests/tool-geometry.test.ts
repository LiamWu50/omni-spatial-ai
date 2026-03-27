import assert from 'node:assert/strict'
import test from 'node:test'

import type { LatLng } from 'leaflet'

import {
  buildFeatureFromPath,
  buildMeasureMetrics,
  formatArea,
  formatLength,
  getFeatureCentroid,
  getPathGeometryType,
  isClosedPath
} from '../src/features/map/services/runtime/tool-geometry'

function createLatLng(lat: number, lng: number) {
  return {
    lat,
    lng,
    distanceTo(other: LatLng) {
      const earthRadius = 6378137
      const toRadians = (value: number) => (value * Math.PI) / 180
      const deltaLat = toRadians(other.lat - lat)
      const deltaLng = toRadians(other.lng - lng)
      const startLat = toRadians(lat)
      const endLat = toRadians(other.lat)
      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

      return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }
  } as LatLng
}

test('getPathGeometryType 应正确判定线与面', () => {
  const points = [createLatLng(30, 120), createLatLng(30, 121), createLatLng(31, 121)]

  assert.equal(getPathGeometryType(points.slice(0, 2), false), 'line')
  assert.equal(getPathGeometryType(points, true), 'polygon')
  assert.equal(getPathGeometryType([points[0]], false), null)
})

test('buildFeatureFromPath 应生成闭合多边形要素', () => {
  const feature = buildFeatureFromPath([createLatLng(30, 120), createLatLng(30, 121), createLatLng(31, 121)], 'polygon')

  assert.equal(feature.geometry.type, 'Polygon')
  assert.deepEqual(feature.geometry.coordinates[0][0], [120, 30])
  assert.deepEqual(feature.geometry.coordinates[0].at(-1), [120, 30])
})

test('buildMeasureMetrics 应生成距离摘要', () => {
  const result = buildMeasureMetrics([createLatLng(0, 0), createLatLng(0, 0.001)], false)

  assert.ok(result)
  assert.equal(result.area, 0)
  assert.equal(result.pointCount, 2)
  assert.match(result.lengthDisplay, /米/)
})

test('buildMeasureMetrics 应生成面积摘要', () => {
  const result = buildMeasureMetrics([createLatLng(0, 0), createLatLng(0, 0.001), createLatLng(0.001, 0.001)], true)

  assert.ok(result)
  assert.ok(result.area > 0)
  assert.equal(result.pointCount, 4)
  assert.match(result.areaDisplay, /平方米/)
  assert.match(result.lengthDisplay, /米/)
})

test('isClosedPath 应按投影距离判断闭合', () => {
  const points = [createLatLng(30, 120), createLatLng(30.5, 121), createLatLng(30.02, 120.03)]
  const closed = isClosedPath(points, (point) => ({ x: point.lng * 100, y: point.lat * 100 }), 5)
  const open = isClosedPath(points, (point) => ({ x: point.lng * 10, y: point.lat * 10 }), 0.1)

  assert.equal(closed, true)
  assert.equal(open, false)
})

test('长度与面积格式化应切换单位', () => {
  assert.equal(formatLength(120), '120 米')
  assert.equal(formatLength(1234), '1.23 千米')
  assert.equal(formatArea(400), '400 平方米')
  assert.equal(formatArea(24567), '2.46 公顷')
  assert.equal(formatArea(2500000), '2.5 平方千米')
})

test('getFeatureCentroid 应返回线和面的重心位置', () => {
  const lineCentroid = getFeatureCentroid({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [120, 30],
        [122, 30]
      ]
    }
  })
  const polygonCentroid = getFeatureCentroid({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [120, 30],
          [122, 30],
          [122, 32],
          [120, 32],
          [120, 30]
        ]
      ]
    }
  })

  assert.deepEqual(lineCentroid, [121, 30])
  assert.deepEqual(polygonCentroid, [121, 31])
})
