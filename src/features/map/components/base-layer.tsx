'use client'

import { Layers3, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import darkMapPreview from '@/assets/images/basemap-dark.png'
import imageryMapPreview from '@/assets/images/basemap-satellite.png'
import lightMapPreview from '@/assets/images/basemap-street.png'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { BASE_MAP_OPTIONS } from '../lib/constants'
import type { BaseLayerType } from '../types'

interface BaseLayerProps {
  activeBaseLayer: BaseLayerType
  onChange: (layer: BaseLayerType) => void
}

const PREVIEW_IMAGE_MAP = {
  dark: darkMapPreview,
  satellite: imageryMapPreview,
  light: lightMapPreview
} as const

export function BaseLayer({ activeBaseLayer, onChange }: BaseLayerProps) {
  const [open, setOpen] = useState(false)
  const activeOption = BASE_MAP_OPTIONS.find((option) => option.key === activeBaseLayer) ?? BASE_MAP_OPTIONS[0]

  return (
    <div className='pointer-events-none absolute bottom-12 left-4 z-10'>
      <div className='pointer-events-auto'>
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            className='group flex flex-col items-center gap-1 rounded-xl border border-(--module-panel-border) bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px]'
            aria-label='打开底图设置'
          >
            <PreviewCard option={activeOption} />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side='top'
          align='start'
          sideOffset={12}
          className='w-[280px] rounded-2xl border border-(--module-panel-border) bg-(--module-panel-bg-solid)/95 p-3 text-neutral-900 shadow-2xl backdrop-blur-xl dark:text-neutral-50'
        >
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 px-1'>
              <Layers3 className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
              <div className='text-sm font-medium text-neutral-900 dark:text-neutral-50'>底图样式</div>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50'
              aria-label='关闭底图设置'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='grid grid-cols-2 gap-2'>
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
                  className={`group relative flex flex-col items-center gap-2 rounded-xl border p-2 transition-all duration-200 ${
                    active
                      ? 'border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/20'
                      : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                  aria-label={`切换到底图：${option.label}`}
                >
                  <div className='relative w-full overflow-hidden rounded-lg'>
                    <div className='aspect-[4/3] w-full relative'>
                      <Image
                        src={PREVIEW_IMAGE_MAP[option.key]}
                        alt={`${option.label}底图预览`}
                        fill
                        className={`object-cover transition-transform duration-500 ${
                          active ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                        sizes='(max-width: 768px) 100vw, 280px'
                        quality={100}
                      />
                    </div>
                    <div className='absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-lg' />
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
      </div>
    </div>
  )
}

function PreviewCard({ option }: { option: (typeof BASE_MAP_OPTIONS)[number] }) {
  const previewImage = PREVIEW_IMAGE_MAP[option.key]

  return (
    <div className='relative size-10 shrink-0 overflow-hidden rounded-[10px] border border-neutral-200 transition dark:border-neutral-700'>
      <Image
        src={previewImage}
        alt={`${option.label}底图预览`}
        fill
        className='object-cover'
        sizes='40px'
        quality={100}
      />
      <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.06)_0%,rgba(2,6,23,0.22)_100%)]' />
    </div>
  )
}
