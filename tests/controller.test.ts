import assert from 'node:assert/strict'
import test from 'node:test'

import { createActionMeta, defaultBaseMaps, type GisAction } from '../src/lib/gis/schema'
import { CesiumAdapter } from '../src/lib/map/adapters/cesium'
import { LeafletAdapter } from '../src/lib/map/adapters/leaflet'
import { MapboxAdapter } from '../src/lib/map/adapters/mapbox'
import { MapController } from '../src/lib/map/controller'

class FakeContainer {
  innerHTML = ''
}

test('MapController 应能派发 MOVE_TO 并更新视图状态', async () => {
  const controller = new MapController({
    engines: {
      mapbox: new MapboxAdapter(),
      cesium: new CesiumAdapter(),
      leaflet: new LeafletAdapter()
    },
    initialEngine: 'mapbox',
    initialBaseMap: defaultBaseMaps().streets
  })

  await controller.mount(new FakeContainer() as unknown as HTMLElement)
  await controller.dispatch({
    type: 'MOVE_TO',
    payload: {
      center: {
        lng: 121.473701,
        lat: 31.230416
      },
      zoom: 12
    },
    meta: createActionMeta('system')
  } satisfies GisAction)

  assert.equal(controller.getView().center.lng, 121.473701)
  assert.equal(controller.getView().zoom, 12)
})

test('MapController 切换引擎时应保留图层状态', async () => {
  const controller = new MapController({
    engines: {
      mapbox: new MapboxAdapter(),
      cesium: new CesiumAdapter(),
      leaflet: new LeafletAdapter()
    },
    initialEngine: 'mapbox',
    initialBaseMap: defaultBaseMaps().streets
  })

  await controller.mount(new FakeContainer() as unknown as HTMLElement)
  await controller.dispatch({
    type: 'ADD_LAYER',
    payload: {
      layer: {
        id: 'demo',
        name: '示例图层',
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
    },
    meta: createActionMeta('system')
  } satisfies GisAction)

  await controller.switchEngine('cesium')

  assert.equal(controller.getActiveEngineType(), 'cesium')
  assert.equal(controller.getLayers().length, 1)
})
