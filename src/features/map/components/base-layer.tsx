'use client'

import Image from 'next/image'
import { useState } from 'react'

import darkMapPreview from '@/assets/images/basemap-dark.png'
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
  light: lightMapPreview
} as const

export function BaseLayer({ activeBaseLayer, onChange }: BaseLayerProps) {
  const [open, setOpen] = useState(false)
  const activeOption = BASE_MAP_OPTIONS.find((option) => option.key === activeBaseLayer) ?? BASE_MAP_OPTIONS[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className='pointer-events-none absolute bottom-12 left-4 z-10'>
        <div className='pointer-events-auto cursor-default'>
          <PopoverTrigger asChild>
            <button
              type='button'
              className='relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px]'
              aria-label='打开底图设置'
            >
              <Image
                src={PREVIEW_IMAGE_MAP[activeOption.key]}
                alt={`${activeOption.label}底图预览`}
                fill
                className='object-cover'
                sizes='40px'
                quality={100}
              />
              <div className='absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10' />
            </button>
          </PopoverTrigger>
        </div>
      </div>

      <PopoverContent
        side='top'
        align='start'
        sideOffset={12}
        className='w-auto rounded-2xl border border-(--module-panel-border) bg-(--module-panel-bg-solid)/95 p-3 text-neutral-900 shadow-2xl backdrop-blur-xl dark:text-neutral-50'
      >
        <div className='flex items-center gap-4'>
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
                className={`group relative flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-all duration-200 ${
                  active
                    ? 'border-transparent bg-neutral-200/60 dark:bg-neutral-700/60'
                    : 'border-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60'
                }`}
                aria-label={`切换到底图：${option.label}`}
              >
                <div className='relative h-14 w-14 overflow-hidden rounded-lg'>
                  <Image
                    src={PREVIEW_IMAGE_MAP[option.key]}
                    alt={`${option.label}底图预览`}
                    fill
                    className='object-cover'
                    sizes='56px'
                    quality={100}
                  />
                  <div className='absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-lg' />
                </div>

                <span
                  className={`text-xs font-medium ${
                    active
                      ? 'text-neutral-900 dark:text-neutral-50'
                      : 'text-neutral-600 dark:text-neutral-400'
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
  )
}
