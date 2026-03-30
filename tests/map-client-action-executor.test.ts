import assert from 'node:assert/strict'
import test from 'node:test'

import type { LayerDescriptor } from '../src/lib/gis/schema'
import { executeMapClientAction, executeMapClientActions } from '../src/features/map/assistant/runtime/client-action-executor'

function createLayer(): LayerDescriptor {
  return {
    id: 'user-layer-demo',
    name: '示例图层',
    sourceType: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    },
    geometryType: 'polygon',
    visible: true,
    style: {
      color: '#60a5fa',
      opacity: 0.8
    },
    crs: 'WGS84'
  }
}

function createRuntimeStub() {
  const layer = createLayer()
  const calls: Array<{ method: string; payload?: unknown }> = []

  return {
    calls,
    runtime: {
      moveTo: async (payload: unknown) => {
        calls.push({ method: 'moveTo', payload })
      },
      fitBounds: async (payload: unknown) => {
        calls.push({ method: 'fitBounds', payload })
      },
      resetView: async () => {
        calls.push({ method: 'resetView' })
      },
      addLayer: async (payload: unknown) => {
        calls.push({ method: 'addLayer', payload })
      },
      updateLayer: async (payload: unknown) => {
        calls.push({ method: 'updateLayer', payload })
      },
      getSnapshot: () => ({
        layers: [layer]
      })
    }
  }
}

test('executeMapClientAction 应执行视角重置与定位范围', async () => {
  const { runtime, calls } = createRuntimeStub()

  await executeMapClientAction(
    {
      type: 'view.reset'
    },
    {
      runtime: runtime as never,
      locateUser: () => {}
    }
  )

  await executeMapClientAction(
    {
      type: 'view.fit_bounds',
      bounds: [120, 30, 121, 31]
    },
    {
      runtime: runtime as never,
      locateUser: () => {}
    }
  )

  assert.deepEqual(calls.map((item) => item.method), ['resetView', 'fitBounds'])
})

test('executeMapClientActions 应按顺序执行添加图层和样式更新', async () => {
  const { runtime, calls } = createRuntimeStub()
  const nextLayer = createLayer()
  nextLayer.id = 'user-layer-next'

  await executeMapClientActions(
    [
      {
        type: 'layer.add',
        layer: nextLayer
      },
      {
        type: 'layer.update_style',
        layerId: 'user-layer-demo',
        style: {
          color: '#ef4444',
          fillOpacity: 0.35,
          visible: false
        }
      }
    ],
    {
      runtime: runtime as never,
      locateUser: () => {}
    }
  )

  assert.equal(calls[0]?.method, 'addLayer')
  assert.equal(calls[1]?.method, 'updateLayer')

  const updatedLayer = calls[1]?.payload as LayerDescriptor
  assert.equal(updatedLayer.visible, false)
  assert.equal(updatedLayer.style.color, '#ef4444')
  assert.equal(updatedLayer.style.fillOpacity, 0.35)
})

test('executeMapClientAction 图层不存在时应抛错', async () => {
  const runtime = {
    getSnapshot: () => ({
      layers: []
    }),
    updateLayer: async () => {}
  }

  await assert.rejects(() =>
    executeMapClientAction(
      {
        type: 'layer.update_style',
        layerId: 'missing-layer',
        style: {
          color: '#ef4444'
        }
      },
      {
        runtime: runtime as never,
        locateUser: () => {}
      }
    )
  )
})
