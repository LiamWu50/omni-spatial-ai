import assert from 'node:assert/strict'
import test from 'node:test'

import type { LayerDescriptor } from '../src/lib/gis/schema'
import { createMapAssistantTools } from '../src/server/chat/tools'

function getExecuteFunction(toolDefinition: any) {
  assert.ok(toolDefinition.execute)
  return async (input: unknown): Promise<any> => {
    const result = (await toolDefinition.execute!(input, {
      toolCallId: 'tool-call-test'
    })) as unknown

    if (Symbol.asyncIterator in Object(result)) {
      throw new Error('当前测试仅支持同步或 Promise 工具输出')
    }

    return result
  }
}

function buildFeatureCollection() {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: '示例点'
        },
        geometry: {
          type: 'Point',
          coordinates: [120.15507, 30.274084]
        }
      }
    ]
  } as const
}

test('map_view_control 应支持地名解析飞行', async () => {
  const tools = createMapAssistantTools({
    geocoder: {
      async geocode(query) {
        assert.equal(query, '杭州西湖')
        return {
          lng: 120.14089,
          lat: 30.25736,
          label: '杭州西湖'
        }
      }
    }
  })

  const execute = getExecuteFunction(tools.map_view_control)
  const result = await execute({
    action: 'fly_to',
    target: {
      type: 'place',
      query: '杭州西湖'
    }
  })

  assert.equal(result.ok, true)
  assert.equal(result.clientActions?.[0]?.type, 'view.fly_to')
})

test('map_view_control 地名未命中时应返回失败结果', async () => {
  const tools = createMapAssistantTools({
    geocoder: {
      async geocode() {
        return null
      }
    }
  })

  const execute = getExecuteFunction(tools.map_view_control)
  const result = await execute({
    action: 'fly_to',
    target: {
      type: 'place',
      query: '不存在的地点'
    }
  })

  assert.equal(result.ok, false)
  assert.equal(result.clientActions, undefined)
})

test('map_layer_load URL 模式应返回添加图层与定位动作', async () => {
  const tools = createMapAssistantTools({
    fetch: async () =>
      new Response(JSON.stringify(buildFeatureCollection()), {
        status: 200,
        headers: {
          'content-type': 'application/json'
        }
      })
  })

  const execute = getExecuteFunction(tools.map_layer_load)
  const result = await execute({
    source: {
      type: 'url',
      url: 'https://example.com/hangzhou.geojson',
      format: 'geojson'
    },
    fitToData: true
  })

  assert.equal(result.ok, true)
  assert.equal(result.clientActions?.[0]?.type, 'layer.add')
  assert.equal(result.clientActions?.[1]?.type, 'view.fit_bounds')
})

test('map_layer_load system 模式应支持系统数据源', async () => {
  const layer: LayerDescriptor = {
    id: 'system-layer-demo',
    name: '系统图层',
    sourceType: 'geojson',
    data: buildFeatureCollection(),
    geometryType: 'point',
    visible: true,
    style: {},
    crs: 'WGS84'
  }

  const tools = createMapAssistantTools({
    systemDatasetLoader: {
      async load(datasetId) {
        assert.equal(datasetId, 'dataset-demo')
        return layer
      }
    }
  })

  const execute = getExecuteFunction(tools.map_layer_load)
  const result = await execute({
    source: {
      type: 'system',
      datasetId: 'dataset-demo'
    },
    fitToData: false
  })

  assert.equal(result.ok, true)
  assert.equal(result.clientActions?.[0]?.type, 'layer.add')
  assert.equal((result.clientActions?.[0] as { layer: LayerDescriptor }).layer.name, '系统图层')
})

test('map_layer_style 应返回结构化样式动作', async () => {
  const tools = createMapAssistantTools()
  const execute = getExecuteFunction(tools.map_layer_style)
  const result = await execute({
    layerId: 'user-layer-demo',
    style: {
      color: '#ef4444',
      opacity: 0.5,
      visible: false
    }
  })

  assert.equal(result.ok, true)
  assert.equal(result.clientActions?.[0]?.type, 'layer.update_style')
})
