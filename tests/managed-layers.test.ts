import assert from 'node:assert/strict'
import test from 'node:test'

import type { Feature, Geometry } from 'geojson'

import {
  createDrawLayerFromFeature,
  createMeasureLayerFromResult,
  getLayerOrigin,
  toUserLayerListItem
} from '../src/features/map/lib/user-layers'

function buildFeature(kind: Geometry['type'], coordinates: unknown) {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: kind,
      coordinates
    }
  } as Feature<Geometry>
}

test('createDrawLayerFromFeature 应生成绘制点图层', () => {
  const layer = createDrawLayerFromFeature({
    feature: buildFeature('Point', [120.5, 30.5]),
    sequence: 1,
    uniqueToken: 'point-1'
  })
  const listItem = toUserLayerListItem(layer)

  assert.match(layer.id, /^draw-layer-point-/)
  assert.equal(layer.name, '点位 01')
  assert.equal(layer.geometryType, 'point')
  assert.equal(getLayerOrigin(layer), 'draw')
  assert.equal(listItem.origin, 'draw')
  assert.equal(listItem.summary, null)
})

test('createDrawLayerFromFeature 应生成绘制多边形图层', () => {
  const layer = createDrawLayerFromFeature({
    feature: buildFeature('Polygon', [
      [
        [120, 30],
        [121, 30],
        [121, 31],
        [120, 30]
      ]
    ]),
    sequence: 2,
    uniqueToken: 'poly-1'
  })

  assert.match(layer.id, /^draw-layer-polygon-/)
  assert.equal(layer.geometryType, 'polygon')
})

test('createMeasureLayerFromResult 应生成距离测量图层摘要', () => {
  const layer = createMeasureLayerFromResult({
    result: {
      area: 0,
      areaDisplay: '0 平方米',
      length: 120,
      lengthDisplay: '120 米',
      pointCount: 2,
      points: [
        [120, 30],
        [121, 31]
      ]
    },
    sequence: 1,
    uniqueToken: 'measure-1'
  })

  assert.ok(layer)
  assert.match(layer.id, /^measure-layer-distance-/)
  assert.equal(layer.name, '距离测量 01')
  assert.equal(layer.geometryType, 'line')
  assert.deepEqual(layer.data.features[0]?.geometry.coordinates, [
    [120, 30],
    [121, 31]
  ])

  const listItem = toUserLayerListItem(layer)
  assert.equal(listItem.origin, 'measure')
  assert.equal(listItem.summary, '距离 120 米')
})

test('createMeasureLayerFromResult 应生成面积测量图层与 bbox', () => {
  const layer = createMeasureLayerFromResult({
    result: {
      area: 400,
      areaDisplay: '400 平方米',
      length: 80,
      lengthDisplay: '80 米',
      pointCount: 4,
      points: [
        [120, 30],
        [121, 30],
        [121, 31],
        [120, 30]
      ]
    },
    sequence: 1,
    uniqueToken: 'measure-area-1'
  })

  assert.ok(layer)
  assert.equal(layer.geometryType, 'polygon')

  const listItem = toUserLayerListItem(layer)
  assert.equal(listItem.summary, '面积 400 平方米 · 周长 80 米')
  assert.deepEqual(listItem.bounds, [120, 30, 121, 31])
})
