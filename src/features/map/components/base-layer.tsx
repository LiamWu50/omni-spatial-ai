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

const BORDER_COLOR_MAP = {
  dark: '#374151',
  light: '#d1d5db'
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
              className='relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-0 border-2 bg-card outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
              style={{ borderColor: activeBaseLayer === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }}
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
            </button>
          </PopoverTrigger>
        </div>
      </div>

      <PopoverContent
        side='top'
        align='start'
        sideOffset={12}
        className='w-auto rounded-0 border border-border bg-card p-3'
      >
        <div>
          <div className='flex items-center gap-5'>
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
                    'group relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-0 border-2 transition-all duration-200'
                  }
                  style={{
                    borderColor: active ? 'var(--ring)' : 'var(--border)',
                    opacity: active ? 1 : 0.5
                  }}
                  aria-label={`切换到底图：${option.label}`}
                >
                  <Image
                    src={PREVIEW_IMAGE_MAP[option.key]}
                    alt={`${option.label}底图预览`}
                    fill
                    className='object-cover'
                    sizes='80px'
                    quality={100}
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
                  {active && <div className='absolute inset-0 bg-ring/20' />}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 font-body"
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
