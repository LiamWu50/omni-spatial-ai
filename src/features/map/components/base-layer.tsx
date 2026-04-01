'use client'

import { Check, Layers3, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import darkMapPreview from '@/assets/images/basemap-dark.png'
import imageryMapPreview from '@/assets/images/basemap-satellite.png'
import terrainMapPreview from '@/assets/images/basemap-terrain.png'
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
            className='group flex flex-col items-center gap-1 rounded-xl border border-(--module-panel-border) bg-(--module-panel-bg) p-0.5 shadow-(--module-panel-shadow) backdrop-blur-[20px]'
            aria-label='打开底图设置'
          >
            <PreviewCard active option={activeOption} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side='top'
          align='start'
          sideOffset={4}
          className='w-[208px] rounded-2xl border border-(--module-panel-border) bg-(--module-panel-bg-solid) p-2 text-neutral-900 shadow-(--module-panel-shadow) dark:text-neutral-50'
        >
          <div className='mb-2 flex items-center justify-between border-b border-(--module-panel-border)'>
            <div className='flex items-center gap-2'>
              <Layers3 className='h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400' />
              <div className='text-xs font-semibold text-neutral-900 dark:text-neutral-50'>底图设置</div>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='flex h-7 w-7 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,border-color,color,box-shadow] duration-180 hover:bg-(--module-button-hover-bg) hover:text-(--module-button-hover-text)'
              aria-label='关闭底图设置'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>

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
                  className={`flex items-center gap-2 rounded-xl border border-(--module-panel-border) bg-(--module-panel-bg-muted) px-1.5 py-1.5 text-left text-(--module-panel-text) transition-[background-color,border-color,color] duration-180 hover:border-(--module-panel-border-strong) hover:bg-(--module-button-hover-bg) ${
                    active ? 'bg-(--module-button-hover-bg)' : ''
                  }`}
                  aria-label={`切换到底图：${option.label}`}
                >
                  <PreviewCard active={active} option={option} />
                  <div className='flex min-w-0 items-center gap-2'>
                    <span
                      className={`text-xs font-semibold ${
                        active ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {option.label}
                    </span>
                    {active ? <Check className='h-3.5 w-3.5 text-neutral-500 dark:text-neutral-300' /> : null}
                  </div>
                </button>
              )
            })}
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
        active
          ? 'border-neutral-300 shadow-[0_0_0_1px_rgba(212,212,212,0.25)]'
          : 'border-neutral-200 dark:border-neutral-700'
      }`}
    >
      <Image src={previewImage} alt={`${option.label}底图预览`} fill className='object-cover' sizes='40px' />
      <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.22)_100%)]' />
    </div>
  )
}
