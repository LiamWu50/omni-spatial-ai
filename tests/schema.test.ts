import assert from 'node:assert/strict'
import test from 'node:test'

import { createActionMeta, gisActionSchema } from '../src/lib/gis/schema'

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
