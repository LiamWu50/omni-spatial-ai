import assert from 'node:assert/strict'
import test from 'node:test'

import { parseUserLayerFile, toUserLayerListItem } from '../src/features/map/lib/user-layers'

test('parseUserLayerFile 应生成用户图层并保留 bbox', async () => {
  const file = new File(
    [
      JSON.stringify({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'A' },
            geometry: {
              type: 'Point',
              coordinates: [120.12, 30.16]
            }
          },
          {
            type: 'Feature',
            properties: { name: 'B' },
            geometry: {
              type: 'Point',
              coordinates: [121.2, 31.3]
            }
          }
        ]
      })
    ],
    'demo.geojson',
    { type: 'application/geo+json' }
  )

  const layer = await parseUserLayerFile(file, 'seed')
  const listItem = toUserLayerListItem(layer)

  assert.match(layer.id, /^user-layer-/)
  assert.equal(layer.name, 'demo.geojson')
  assert.equal(layer.visible, true)
  assert.equal(listItem.featureCount, 2)
  assert.deepEqual(listItem.bounds, [120.12, 30.16, 121.2, 31.3])
})

test('parseUserLayerFile 应拒绝空要素集合', async () => {
  const file = new File(
    [
      JSON.stringify({
        type: 'FeatureCollection',
        features: []
      })
    ],
    'empty.geojson',
    { type: 'application/geo+json' }
  )

  await assert.rejects(() => parseUserLayerFile(file, 'empty'), /无有效要素/)
})
