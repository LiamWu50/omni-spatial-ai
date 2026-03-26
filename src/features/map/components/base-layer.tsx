'use client'

import { Check, Layers3, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import terrainMapPreview from '@/assets/images/map/地形底图.png'
import imageryMapPreview from '@/assets/images/map/影像底图.png'
import darkMapPreview from '@/assets/images/map/暗黑底图.png'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { BASE_MAP_OPTIONS } from '../lib/constants'
import type { BaseLayerType } from '../types'

interface BaseLayerProps {
  activeBaseLayer: BaseLayerType
  onChange: (layer: BaseLayerType) => void
}

const PREVIEW_IMAGE_MAP = {
  vector: darkMapPreview,
  satellite: imageryMapPreview,
  terrain: terrainMapPreview
} as const

export function BaseLayer({ activeBaseLayer, onChange }: BaseLayerProps) {
  const [open, setOpen] = useState(false)
  const activeOption = BASE_MAP_OPTIONS.find((option) => option.key === activeBaseLayer) ?? BASE_MAP_OPTIONS[0]

  return (
    <div className='absolute bottom-12 left-4 z-10'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='group flex flex-col items-center gap-1 rounded-xl border border-neutral-800/90 bg-neutral-950/90 px-1.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl'
            aria-label='打开底图设置'
          >
            <PreviewCard active option={activeOption} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side='top'
          align='start'
          sideOffset={4}
          className='w-[208px] rounded-2xl border border-neutral-800 bg-neutral-950 p-2 text-neutral-50 shadow-lg'
        >
          <div className='mb-2 flex items-center justify-between border-b border-neutral-800 px-1 pb-2'>
            <div className='flex items-center gap-2'>
              <Layers3 className='h-3.5 w-3.5 text-neutral-400' />
              <div className='text-xs font-semibold text-neutral-50'>底图设置</div>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-50'
              aria-label='关闭底图设置'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>

          <div>
            <div className='grid gap-1'>
              {BASE_MAP_OPTIONS.map((option) => {
                const active = option.key === activeBaseLayer

                return (
                  <button
                    key={option.key}
                    type='button'
                    onClick={() => {
                      onChange(option.key)
                      setOpen(false)
                    }}
                    className={`flex items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-neutral-900 ${
                      active ? 'bg-neutral-900' : ''
                    }`}
                    aria-label={`切换到底图：${option.label}`}
                  >
                    <PreviewCard active={active} option={option} />
                    <div className='flex min-w-0 items-center gap-2'>
                      <span className={`text-xs font-semibold ${active ? 'text-neutral-50' : 'text-neutral-200'}`}>
                        {option.label}
                      </span>
                      {active ? <Check className='h-3.5 w-3.5 text-neutral-300' /> : null}
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

function PreviewCard({ active = false, option }: { active?: boolean; option: (typeof BASE_MAP_OPTIONS)[number] }) {
  const previewImage = PREVIEW_IMAGE_MAP[option.key]

  return (
    <div
      className={`relative size-10 shrink-0 overflow-hidden rounded-[10px] transition ${
        active ? 'border-neutral-300 shadow-[0_0_0_1px_rgba(212,212,212,0.25)]' : 'border-neutral-700'
      }`}
    >
      <Image src={previewImage} alt={`${option.label}底图预览`} fill className='object-cover' sizes='40px' />
      <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.22)_100%)]' />
    </div>
  )
}
