'use client'

import { Check, Layers3, X } from 'lucide-react'
import { useState } from 'react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { BaseLayerType } from '../types'

interface BaseMapProps {
  activeBaseLayer: BaseLayerType
  onChange: (layer: BaseLayerType) => void
}

const BASEMAP_OPTIONS: Array<{
  key: BaseLayerType
  label: string
  previewClassName: string
}> = [
  {
    key: 'satellite',
    label: '影像',
    previewClassName: 'bg-[linear-gradient(135deg,#86efac_0%,#38bdf8_42%,#1d4ed8_100%)]'
  },
  {
    key: 'terrain',
    label: '地形',
    previewClassName: 'bg-[linear-gradient(135deg,#d9f99d_0%,#86efac_26%,#7dd3fc_56%,#cbd5e1_100%)]'
  },
  {
    key: 'vector',
    label: '矢量',
    previewClassName: 'bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_34%,#93c5fd_62%,#2563eb_100%)]'
  }
]

export function BaseMap({ activeBaseLayer, onChange }: BaseMapProps) {
  const [open, setOpen] = useState(false)
  const activeOption = BASEMAP_OPTIONS.find((option) => option.key === activeBaseLayer) ?? BASEMAP_OPTIONS[0]

  return (
    <div className='absolute left-6 bottom-10 z-10'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='earth-panel group flex flex-col items-center gap-1 rounded px-2 py-2'
            aria-label='打开底图设置'
          >
            <PreviewCard active option={activeOption} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side='top'
          align='start'
          sideOffset={4}
          className='w-[248px] rounded-[20px] border border-white/10 bg-[#121212] p-0 text-white shadow-[0_24px_64px_rgba(0,0,0,0.42)]'
        >
          <div className='flex items-center justify-between border-b border-white/8 px-3 py-2.5'>
            <div className='flex items-center gap-2'>
              <Layers3 className='h-4 w-4 text-white/72' />
              <div className='text-sm font-semibold text-white'>基本地图设置</div>
            </div>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='flex h-8 w-8 items-center justify-center rounded-full text-white/72 transition hover:bg-white/8 hover:text-white'
                aria-label='关闭底图设置'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='px-3 py-3'>
            <div className='mb-2 text-xs font-semibold text-white/88'>类型</div>
            <div className='grid gap-1.5'>
              {BASEMAP_OPTIONS.map((option) => {
                const active = option.key === activeBaseLayer

                return (
                  <button
                    key={option.key}
                    type='button'
                    onClick={() => {
                      onChange(option.key)
                      setOpen(false)
                    }}
                    className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/5 ${
                      active ? 'bg-white/6' : ''
                    }`}
                    aria-label={`切换到底图：${option.label}`}
                  >
                    <PreviewCard active={active} option={option} large />
                    <div className='flex items-center gap-3'>
                      <span className={`text-base font-semibold ${active ? 'text-[#b9d0ff]' : 'text-white'}`}>
                        {option.label}
                      </span>
                      {active ? <Check className='h-4 w-4 text-[#b9d0ff]' /> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function PreviewCard({
  active = false,
  large = false,
  option
}: {
  active?: boolean
  large?: boolean
  option: (typeof BASEMAP_OPTIONS)[number]
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border transition ${
        large ? 'h-12 w-12' : 'h-12 w-12'
      } ${active ? 'border-[#b9d0ff] shadow-[0_0_0_1px_rgba(185,208,255,0.2)]' : 'border-white/12'} ${option.previewClassName}`}
    >
      <div
        className={`absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.36)_1px,transparent_1px),linear-gradient(transparent_0%,rgba(255,255,255,0.36)_1px,transparent_1px)] ${
          large ? 'bg-[size:14px_14px]' : 'bg-[size:14px_14px]'
        } opacity-70`}
      />
    </div>
  )
}
