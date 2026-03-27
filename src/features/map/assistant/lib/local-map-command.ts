import type { UIMessage } from 'ai'

import type { BaseLayerType, MapViewportState, ShellPanelState } from '../../types'

export interface LocalMapCommandContext {
  viewport: MapViewportState
  activeBaseLayer: BaseLayerType
  panels: ShellPanelState
  visibleLayerCount: number
  onLocate: () => void
  onResetView: () => void
  onSwitchBaseLayer: (layer: BaseLayerType) => void
  onToggleLayerList: () => void
  onToggleAssistantPanel: (open?: boolean) => void
}

export interface LocalMapCommandResult {
  handled: boolean
  responseText: string
  actions: string[]
}

export function getTextFromMessageParts(parts: UIMessage['parts'] | undefined) {
  if (!parts) {
    return ''
  }

  return parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim()
}

export function getLatestUserText(messages: readonly Pick<UIMessage, 'role' | 'parts'>[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')

  if (!latestUserMessage) {
    return ''
  }

  return getTextFromMessageParts(latestUserMessage.parts)
}

function summarize({ activeBaseLayer, panels, viewport, visibleLayerCount }: LocalMapCommandContext) {
  return `中心点 ${viewport.center.lng.toFixed(5)}, ${viewport.center.lat.toFixed(5)}；缩放 ${viewport.zoom.toFixed(1)}；底图 ${activeBaseLayer}；图层 ${visibleLayerCount}；图层管理 ${panels.layerManagerOpen ? '开' : '关'}。`
}

export function executeLocalMapCommand(prompt: string, context: LocalMapCommandContext): LocalMapCommandResult | null {
  const normalizedPrompt = prompt.trim().toLowerCase()

  if (!normalizedPrompt) {
    return null
  }

  const actions: string[] = []

  if (normalizedPrompt.includes('定位')) {
    context.onLocate()
    actions.push('已执行定位')
  }

  if (
    normalizedPrompt.includes('初始化') ||
    normalizedPrompt.includes('重置') ||
    normalizedPrompt.includes('回到默认')
  ) {
    context.onResetView()
    actions.push('已重置视角')
  }

  if (normalizedPrompt.includes('影像') || normalizedPrompt.includes('卫星')) {
    context.onSwitchBaseLayer('satellite')
    actions.push('已切换到影像底图')
  } else if (normalizedPrompt.includes('地形')) {
    context.onSwitchBaseLayer('terrain')
    actions.push('已切换到地形底图')
  } else if (normalizedPrompt.includes('矢量')) {
    context.onSwitchBaseLayer('vector')
    actions.push('已切换到矢量底图')
  }

  if (normalizedPrompt.includes('图层')) {
    context.onToggleLayerList()
    actions.push('已切换图层面板')
  }

  if (normalizedPrompt.includes('助手') || normalizedPrompt.includes('聊天') || normalizedPrompt.includes('ai')) {
    context.onToggleAssistantPanel(true)
    actions.push('已打开 AI 面板')
  }

  if (actions.length === 0) {
    return null
  }

  return {
    handled: true,
    actions,
    responseText: `${actions.join('，')}。\n${summarize(context)}`
  }
}
