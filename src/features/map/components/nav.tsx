'use client'

import { Compass, Crosshair, Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

interface MapNavProps {
  is3D: boolean
  onLocate: () => void
  onResetOrientation: () => void
  onToggle3D: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function Nav({ is3D, onLocate, onResetOrientation, onToggle3D, onZoomIn, onZoomOut }: MapNavProps) {
  return (
    <div className='absolute bottom-12 right-4 z-30 flex items-center gap-3'>
      <div className='flex items-center gap-2'>
        <RoundAction label='定位' onClick={onLocate}>
          <Crosshair className='h-4 w-4' />
        </RoundAction>
        <RoundAction label='切换 3D' active={is3D} onClick={onToggle3D}>
          <span className='text-sm font-semibold'>{is3D ? '3D' : '2D'}</span>
        </RoundAction>
        <RoundAction label='罗盘' onClick={onResetOrientation}>
          <Compass className='h-4 w-4' />
        </RoundAction>
      </div>

      <div className='flex h-10 items-center rounded-full border border-neutral-200/90 bg-white/90 px-1 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-neutral-800/90 dark:bg-neutral-950/90 dark:shadow-[0_10px_30px_rgba(0,0,0,0.32)]'>
        <button
          type='button'
          onClick={onZoomOut}
          className='flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white'
          aria-label='缩小'
        >
          <Minus className='h-4 w-4' />
        </button>
        <div className='mx-1 h-6 w-px bg-neutral-200 dark:bg-neutral-800' />
        <button
          type='button'
          onClick={onZoomIn}
          className='flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white'
          aria-label='放大'
        >
          <Plus className='h-4 w-4' />
        </button>
      </div>
    </div>
  )
}

function RoundAction({
  active,
  children,
  label,
  onClick
}: {
  active?: boolean
  children: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white/90 text-neutral-600 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:bg-neutral-100 hover:text-neutral-950 dark:border-neutral-800/90 dark:bg-neutral-950/90 dark:text-neutral-200 dark:shadow-[0_10px_30px_rgba(0,0,0,0.32)] dark:hover:bg-neutral-800 dark:hover:text-white ${
        active ? 'bg-neutral-900 text-neutral-50 dark:bg-neutral-800 dark:text-neutral-50' : ''
      }`}
    >
      {children}
    </button>
  )
}
