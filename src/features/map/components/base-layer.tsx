'use client'

import { Map, X } from 'lucide-react'
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
              className='relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-primary-foreground bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px]'
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
        className='w-auto rounded-2xl border border-(--module-panel-border) bg-(--module-panel-bg-solid)/95 text-neutral-900 shadow-2xl backdrop-blur-xl dark:text-neutral-50'
      >
        <div className='flex items-center justify-between pb-2'>
          <div className='flex items-center gap-2 text-[14px] font-semibold text-neutral-900 dark:text-neutral-50'>
            <span className='flex h-7 w-7 items-center justify-center rounded-full bg-(--module-panel-bg-muted) text-(--module-panel-icon)'>
              <Map className='h-4 w-4' />
            </span>
            <span>底图设置</span>
          </div>
          <button
            type='button'
            onClick={() => setOpen(false)}
            className='flex h-8 w-8 items-center justify-center rounded-full text-(--module-panel-icon) transition-colors duration-200 hover:bg-(--module-button-hover-bg)'
            aria-label='关闭底图设置面板'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
        <div className='px-2.5 pb-3'>
          <div className='flex items-center gap-3'>
            {BASE_MAP_OPTIONS.map((option) => {
              const active = option.key === activeBaseLayer

              return (
                <button
                  key={option.key}
                  type='button'
                  onClick={() => {
                    onChange(option.key)
                  }}
                  className={
                    'group relative flex flex-col items-center gap-2 rounded-xl p-2 transition-all duration-200'
                  }
                  aria-label={`切换到底图：${option.label}`}
                >
                  <div className='relative h-10 w-14 overflow-hidden'>
                    <Image
                      src={PREVIEW_IMAGE_MAP[option.key]}
                      alt={`${option.label}底图预览`}
                      fill
                      className='object-cover'
                      sizes='36px'
                      quality={100}
                    />
                    <div className='absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10' />
                    {active && <div className='absolute inset-0 bg-(--primary-color)/20' />}
                  </div>

                  <span
                    className={`text-xs font-medium ${
                      active ? 'text-(--primary-color)' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
