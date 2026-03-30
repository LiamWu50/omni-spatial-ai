import assert from 'node:assert/strict'
import test from 'node:test'

import {
  mapClientActionDispatchSchema,
  mapClientActionSchema,
  mapLayerLoadInputSchema,
  mapLayerStyleInputSchema,
  mapViewControlInputSchema
} from '../src/features/map/assistant/tools/contracts'

test('map_view_control schema 应接受地名飞行输入', () => {
  const action = mapViewControlInputSchema.parse({
    action: 'fly_to',
    target: {
      type: 'place',
      query: '杭州西湖'
    }
  })

  assert.equal(action.action, 'fly_to')
  assert.equal(action.target.type, 'place')
})

test('map_layer_load schema 应拒绝非 geojson 格式', () => {
  assert.throws(() =>
    mapLayerLoadInputSchema.parse({
      source: {
        type: 'url',
        url: 'https://example.com/demo.kml',
        format: 'kml'
      }
    })
  )
})

test('map_layer_style schema 应校验安全样式子集', () => {
  const action = mapLayerStyleInputSchema.parse({
    layerId: 'user-layer-demo',
    style: {
      color: '#ef4444',
      fillOpacity: 0.35,
      visible: false
    }
  })

  assert.equal(action.style.visible, false)
  assert.throws(() =>
    mapLayerStyleInputSchema.parse({
      layerId: 'user-layer-demo',
      style: {
        opacity: 1.2
      }
    })
  )
})

test('mapClientActionDispatch schema 应接受结构化动作分发', () => {
  const dispatch = mapClientActionDispatchSchema.parse({
    toolCallId: 'tool-call-1',
    toolName: 'map_layer_style',
    result: {
      ok: true,
      message: '已准备更新样式。',
      clientActions: [
        {
          type: 'layer.update_style',
          layerId: 'user-layer-demo',
          style: {
            color: '#ef4444',
            visible: true
          }
        }
      ]
    }
  })

  const action = mapClientActionSchema.parse(dispatch.result.clientActions?.[0])
  assert.equal(action.type, 'layer.update_style')
})
