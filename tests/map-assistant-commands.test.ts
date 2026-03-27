import assert from 'node:assert/strict'
import test from 'node:test'

import { executeLocalMapCommand, getLatestUserText } from '../src/features/map/assistant/lib/local-map-command'

function createContext() {
  const events: string[] = []

  return {
    events,
    context: {
      viewport: {
        center: {
          lng: 120.12345,
          lat: 30.54321
        },
        zoom: 11.2,
        pitch: 0,
        bearing: 0
      },
      activeBaseLayer: 'vector' as const,
      panels: {
        layerManagerOpen: false,
        assistantPanelOpen: true
      },
      visibleLayerCount: 3,
      onLocate: () => events.push('locate'),
      onResetView: () => events.push('reset'),
      onSwitchBaseLayer: (layer: 'vector' | 'satellite' | 'terrain') => events.push(`base:${layer}`),
      onToggleLayerList: () => events.push('layers'),
      onToggleAssistantPanel: (open?: boolean) => events.push(`assistant:${String(open)}`)
    }
  }
}

test('getLatestUserText 应提取最后一条用户文本', () => {
  const text = getLatestUserText([
    {
      role: 'assistant',
      parts: [{ type: 'text', text: '你好' }]
    },
    {
      role: 'user',
      parts: [{ type: 'text', text: '请帮我定位' }]
    }
  ])

  assert.equal(text, '请帮我定位')
})

test('executeLocalMapCommand 命中地图指令时应返回本地响应', () => {
  const { context, events } = createContext()
  const result = executeLocalMapCommand('请帮我切换影像底图并打开图层', context)

  assert.ok(result)
  assert.equal(result?.handled, true)
  assert.deepEqual(events, ['base:satellite', 'layers'])
  assert.match(result?.responseText ?? '', /已切换到影像底图，已切换图层面板/)
})

test('executeLocalMapCommand 命中定位与助手指令时应执行对应动作', () => {
  const { context, events } = createContext()
  const result = executeLocalMapCommand('定位并打开助手', context)

  assert.ok(result)
  assert.deepEqual(events, ['locate', 'assistant:true'])
})

test('executeLocalMapCommand 未命中地图指令时应返回 null', () => {
  const { context, events } = createContext()
  const result = executeLocalMapCommand('介绍一下 GeoJSON 是什么', context)

  assert.equal(result, null)
  assert.deepEqual(events, [])
})
