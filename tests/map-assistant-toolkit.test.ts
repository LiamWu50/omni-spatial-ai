import assert from 'node:assert/strict'
import test from 'node:test'

import { mapAssistantToolDescriptions, mapAssistantToolMetadata } from '../src/features/assistant/lib/contracts'
import { createMapAssistantTools } from '../src/server/chat/tools'

test('map assistant 前端工具注册 key 应与服务端工具保持一致', () => {
  const toolkitKeys = Object.keys(mapAssistantToolMetadata).sort()
  const serverToolKeys = Object.keys(createMapAssistantTools()).sort()

  assert.deepEqual(toolkitKeys, serverToolKeys)
})

test('map assistant 前端工具描述应与共享描述常量保持一致', () => {
  assert.equal(mapAssistantToolMetadata.map_view_control.description, mapAssistantToolDescriptions.map_view_control)
  assert.equal(mapAssistantToolMetadata.map_layer_load.description, mapAssistantToolDescriptions.map_layer_load)
  assert.equal(mapAssistantToolMetadata.map_layer_style.description, mapAssistantToolDescriptions.map_layer_style)
})
