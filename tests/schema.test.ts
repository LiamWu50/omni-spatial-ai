import assert from 'node:assert/strict'
import test from 'node:test'

import { createActionMeta } from '../src/lib/gis/defaults'
import { engineTypeSchema, gisActionSchema } from '../src/lib/gis/schema'

test('EngineType schema 仅接受 leaflet', () => {
  assert.equal(engineTypeSchema.parse('leaflet'), 'leaflet')
  assert.throws(() => engineTypeSchema.parse('mapbox'))
})

test('GisAction schema 应接受合法 MOVE_TO 动作', () => {
  const action = gisActionSchema.parse({
    type: 'MOVE_TO',
    payload: {
      center: {
        lng: 120.15507,
        lat: 30.274084
      },
      zoom: 11
    },
    meta: createActionMeta('ai')
  })

  assert.equal(action.type, 'MOVE_TO')
})

test('GisAction schema 应拒绝缺失 center 的 MOVE_TO 动作', () => {
  assert.throws(() =>
    gisActionSchema.parse({
      type: 'MOVE_TO',
      payload: {},
      meta: createActionMeta('ai')
    })
  )
})

test('GisAction schema 应接受合法 UPDATE_LAYER 动作', () => {
  const action = gisActionSchema.parse({
    type: 'UPDATE_LAYER',
    payload: {
      layer: {
        id: 'user-layer-demo',
        name: '示例上传图层',
        sourceType: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        geometryType: 'mixed',
        visible: false,
        style: {},
        crs: 'WGS84'
      }
    },
    meta: createActionMeta('ui')
  })

  assert.equal(action.type, 'UPDATE_LAYER')
  assert.equal(action.payload.layer.visible, false)
})
