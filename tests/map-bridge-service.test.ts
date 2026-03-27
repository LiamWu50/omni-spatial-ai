import assert from 'node:assert/strict'
import test from 'node:test'

import { MapRuntime } from '../src/features/map/services/map-runtime'

test('MapRuntime 应能识别底图类型并转换视口状态', () => {
  const runtime = new MapRuntime()
  const snapshot = runtime.getSnapshot()

  assert.equal(runtime.getBaseLayerType(snapshot.baseMap), 'vector')

  const viewport = runtime.toViewportState(snapshot)

  assert.equal(viewport.center.lng, 113.86005)
  assert.equal(viewport.zoom, 2.8)
  assert.equal(viewport.pitch, 0)
  assert.equal(viewport.bearing, 0)
})

test('MapRuntime 切换底图后应更新快照', async () => {
  const runtime = new MapRuntime()

  await runtime.switchBaseLayer('satellite')
  assert.equal(runtime.getBaseLayerType(runtime.getSnapshot().baseMap), 'satellite')

  await runtime.switchBaseLayer('terrain')
  assert.equal(runtime.getBaseLayerType(runtime.getSnapshot().baseMap), 'terrain')
})

test('MapRuntime 缩放辅助逻辑应遵守上下限', async () => {
  const runtime = new MapRuntime()

  await runtime.setZoom(11.8)
  await runtime.zoomIn()
  assert.equal(runtime.getSnapshot().view.zoom, 12)

  await runtime.setZoom(1.9)
  await runtime.zoomOut()
  assert.equal(runtime.getSnapshot().view.zoom, 1.8)
})

test('MapRuntime 应能重置视角并执行定位', async () => {
  const runtime = new MapRuntime()

  await runtime.locate({ lng: 120.15507, lat: 30.274084 })
  assert.equal(runtime.getSnapshot().view.center.lng, 120.15507)
  assert.equal(runtime.getSnapshot().view.zoom, 8.8)

  await runtime.resetView()
  assert.equal(runtime.getSnapshot().view.center.lng, 113.86005)
  assert.equal(runtime.getSnapshot().view.zoom, 2.8)
})
