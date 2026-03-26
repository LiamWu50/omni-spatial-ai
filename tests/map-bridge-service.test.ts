import assert from 'node:assert/strict'
import test from 'node:test'

import { MapBridgeService } from '../src/features/map/helps/map-bridge-service'

test('MapBridgeService 应能识别底图类型并转换视口状态', () => {
  const bridge = new MapBridgeService()
  const snapshot = bridge.getSnapshot()

  assert.equal(bridge.getBaseLayerType(snapshot.baseMap), 'vector')

  const viewport = bridge.toViewportState(snapshot)

  assert.equal(viewport.activeEngine, 'leaflet')
  assert.equal(viewport.is3D, false)
  assert.equal(viewport.center.lng, 113.86005)
  assert.equal(viewport.zoom, 2.8)
  assert.equal(viewport.cameraAltitudeKm, 24490)
})

test('MapBridgeService 切换底图后应更新快照', async () => {
  const bridge = new MapBridgeService()

  await bridge.switchBaseLayer('satellite')
  assert.equal(bridge.getBaseLayerType(bridge.getSnapshot().baseMap), 'satellite')

  await bridge.switchBaseLayer('terrain')
  assert.equal(bridge.getBaseLayerType(bridge.getSnapshot().baseMap), 'terrain')
})

test('MapBridgeService 缩放辅助逻辑应遵守上下限', async () => {
  const bridge = new MapBridgeService()

  await bridge.setZoom(11.8)
  await bridge.zoomIn()
  assert.equal(bridge.getSnapshot().view.zoom, 12)

  await bridge.setZoom(1.9)
  await bridge.zoomOut()
  assert.equal(bridge.getSnapshot().view.zoom, 1.8)
})
