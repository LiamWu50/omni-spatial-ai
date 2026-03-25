'use client'

import { type ChatModelAdapter, useLocalRuntime } from '@assistant-ui/react'
import { useEffect, useMemo, useRef } from 'react'

import type { BaseLayerType, MapViewportState, ShellPanelState } from '../types'

interface MapAssistantRuntimeOptions {
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

function getLatestUserText(messages: ReadonlyArray<{ role: string; content: unknown }>) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')

  if (!latestUserMessage) {
    return ''
  }

  if (typeof latestUserMessage.content === 'string') {
    return latestUserMessage.content.trim()
  }

  if (Array.isArray(latestUserMessage.content)) {
    return latestUserMessage.content
      .map((part) => {
        if (part && typeof part === 'object' && 'type' in part && 'text' in part && part.type === 'text') {
          return String(part.text)
        }

        return ''
      })
      .join(' ')
      .trim()
  }

  return ''
}

function summarize({ activeBaseLayer, panels, viewport, visibleLayerCount }: MapAssistantRuntimeOptions) {
  return `中心点 ${viewport.center.lng.toFixed(5)}, ${viewport.center.lat.toFixed(5)}；缩放 ${viewport.zoom.toFixed(1)}；引擎 ${viewport.activeEngine}；底图 ${activeBaseLayer}；图层 ${visibleLayerCount}；图层管理 ${panels.layerManagerOpen ? '开' : '关'}。`
}

export function useMapAssistantRuntime(options: MapAssistantRuntimeOptions) {
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const chatModel = useMemo<ChatModelAdapter>(
    () => ({
      async run({ messages }) {
        const current = optionsRef.current
        const prompt = getLatestUserText(messages as ReadonlyArray<{ role: string; content: unknown }>)
        const normalizedPrompt = prompt.toLowerCase()
        const actions: string[] = []

        if (prompt) {
          current.onToggleAssistantPanel(true)
        }

        if (normalizedPrompt.includes('定位')) {
          current.onLocate()
          actions.push('已执行定位')
        }

        if (
          normalizedPrompt.includes('初始化') ||
          normalizedPrompt.includes('重置') ||
          normalizedPrompt.includes('回到默认')
        ) {
          current.onResetView()
          actions.push('已重置视角')
        }

        if (normalizedPrompt.includes('影像') || normalizedPrompt.includes('卫星')) {
          current.onSwitchBaseLayer('satellite')
          actions.push('已切换到影像底图')
        } else if (normalizedPrompt.includes('地形')) {
          current.onSwitchBaseLayer('terrain')
          actions.push('已切换到地形底图')
        } else if (normalizedPrompt.includes('矢量')) {
          current.onSwitchBaseLayer('vector')
          actions.push('已切换到矢量底图')
        }

        if (normalizedPrompt.includes('图层')) {
          current.onToggleLayerList()
          actions.push('已切换图层面板')
        }

        if (normalizedPrompt.includes('助手') || normalizedPrompt.includes('聊天') || normalizedPrompt.includes('ai')) {
          current.onToggleAssistantPanel(true)
          actions.push('已打开 AI 面板')
        }

        return {
          content: [
            {
              type: 'text',
              text:
                actions.length > 0
                  ? `${actions.join('，')}。\n${summarize(current)}`
                  : `已收到指令「${prompt || '（空）'}」。\n你可以继续输入：定位、影像底图、打开图层、打开助手。\n${summarize(current)}`
            }
          ]
        }
      }
    }),
    []
  )

  return useLocalRuntime(chatModel, {
    initialMessages: [
      {
        role: 'assistant',
        content: '地图助手已就绪。你可以让我帮你定位、切换影像底图、打开图层管理或展开 AI 面板。'
      }
    ]
  })
}
