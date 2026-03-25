'use client'

import { useState, useSyncExternalStore } from 'react'

import { submitSpatialPrompt } from '@/app/actions/chat'
import { createActionMeta, defaultBaseMaps } from '@/lib/gis/schema'
import { actionBus } from '@/lib/map/event-bus'

import { mapRuntimeBridge } from './map-canvas'

interface ChatPanelProps {
  selectedBaseMapId: string
}

interface LocalMessage {
  role: 'user' | 'assistant'
  content: string
}

export function ChatPanel({ selectedBaseMapId }: ChatPanelProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      role: 'assistant',
      content: '你好，我可以帮你移动地图、切换底图、导入后的图层查询与缓冲区分析。'
    }
  ])
  const [prompt, setPrompt] = useState('')
  const [isPending, setIsPending] = useState(false)
  const runtimeState = useSyncExternalStore(
    mapRuntimeBridge.subscribe,
    mapRuntimeBridge.getSnapshot,
    mapRuntimeBridge.getSnapshot
  )

  const placeholder = '例：移动到杭州并切换天地图，再对上传图层做 500 米缓冲区'

  async function sendMessage() {
    const content = prompt.trim()
    if (!content) {
      return
    }

    setMessages((current) => [...current, { role: 'user', content }])
    setPrompt('')

    const baseMap = defaultBaseMaps()[selectedBaseMapId]
    if (baseMap) {
      await actionBus.emit({
        type: 'SWITCH_BASEMAP',
        payload: {
          baseMap
        },
        meta: createActionMeta('ui')
      })
    }

    setIsPending(true)

    try {
      const response = await submitSpatialPrompt({
        prompt: content,
        layers: runtimeState.layers
      })

      if (response.actions.length > 0) {
        await actionBus.emitMany(response.actions)
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: response.reply
        }
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'AI 调度失败，请稍后再试。'
        }
      ])
    } finally {
      setIsPending(false)
    }
  }

  return (
    <section className='flex min-h-[320px] flex-1 flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold'>AI 调度台</h2>
        <span className='text-xs text-slate-400'>Server Action</span>
      </div>

      <div className='mt-3 flex-1 space-y-3 overflow-auto rounded-2xl bg-black/20 p-3'>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-6 ${
              message.role === 'assistant' ? 'bg-white/8 text-slate-100' : 'ml-auto bg-sky-500/15 text-sky-100'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isPending ? (
          <div className='max-w-[92%] rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-300'>
            正在编排地图动作与分析工具...
          </div>
        ) : null}
      </div>

      <div className='mt-4 space-y-3'>
        <textarea
          className='min-h-[88px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400'
          value={prompt}
          placeholder={placeholder}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <div className='flex items-center justify-between gap-3'>
          <p className='text-xs text-slate-400'>
            当前图层 {runtimeState.layers.length} 个，活动引擎 {runtimeState.activeEngine}
          </p>
          <button
            onClick={sendMessage}
            disabled={isPending}
            className='rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400'
          >
            发送指令
          </button>
        </div>
      </div>
    </section>
  )
}
