import assert from 'node:assert/strict'
import test from 'node:test'

import type { LayerDescriptor } from '../src/lib/gis/schema'
import { MapRuntime } from '../src/features/map/services/map-runtime'

function createLayer(id = 'demo'): LayerDescriptor {
  return {
    id,
    name: `图层-${id}`,
    sourceType: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    },
    geometryType: 'mixed',
    visible: true,
    style: {},
    crs: 'WGS84'
  }
}

test('MapRuntime 应能更新视图状态', async () => {
  const runtime = new MapRuntime()

  await runtime.moveTo({
    center: {
      lng: 121.473701,
      lat: 31.230416
    },
    zoom: 12
  })

  assert.equal(runtime.getSnapshot().view.center.lng, 121.473701)
  assert.equal(runtime.getSnapshot().view.zoom, 12)
})

test('MapRuntime 应能维护图层增删改状态', async () => {
  const runtime = new MapRuntime()

  await runtime.addLayer(createLayer())
  assert.equal(runtime.getSnapshot().layers.length, 1)

  await runtime.updateLayer({
    ...runtime.getSnapshot().layers[0],
    visible: false
  })
  assert.equal(runtime.getSnapshot().layers[0]?.visible, false)

  await runtime.removeLayer('demo')
  assert.equal(runtime.getSnapshot().layers.length, 0)
})

test('MapRuntime 应能处理 FIT_BOUNDS 并更新中心点', async () => {
  const runtime = new MapRuntime()

  await runtime.fitBounds([110, 30, 130, 40])

  assert.deepEqual(runtime.getSnapshot().view.center, {
    lng: 120,
    lat: 35
  })
})

test('MapRuntime 应能维护工具激活状态', () => {
  const runtime = new MapRuntime()

  runtime.setActiveTool('measure')
  assert.equal(runtime.getSnapshot().activeTool, 'measure')

  runtime.setActiveTool(null)
  assert.equal(runtime.getSnapshot().activeTool, null)
})
