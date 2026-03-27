import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_CHAT_MODEL, resolveChatModelId } from '../src/features/map/lib/models'

test('resolveChatModelId 应回退到默认模型', () => {
  assert.equal(resolveChatModelId('invalid-model'), DEFAULT_CHAT_MODEL)
  assert.equal(resolveChatModelId(undefined), DEFAULT_CHAT_MODEL)
})

test('resolveChatModelId 应保留合法模型', () => {
  assert.equal(resolveChatModelId('qwen-flash'), 'qwen-flash')
  assert.equal(resolveChatModelId('qwen-turbo'), 'qwen-turbo')
})
