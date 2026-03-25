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
    <div className='absolute bottom-16 right-8 z-30 flex items-center gap-3'>
      <div className='flex items-center gap-2'>
        <RoundAction label='定位' onClick={onLocate}>
          <Crosshair className='h-4 w-4' />
        </RoundAction>
        <RoundAction label='切换 3D' active={is3D} onClick={onToggle3D}>
          <span className='text-sm font-semibold'>{is3D ? '3D' : '2D'}</span>
        </RoundAction>
        <RoundAction label='罗盘' onClick={onResetOrientation}>
          <Compass className='h-4 w-4 text-orange-300' />
        </RoundAction>
      </div>

      <div className='earth-panel flex h-10 items-center rounded-full px-1'>
        <button
          type='button'
          onClick={onZoomOut}
          className='flex h-10 w-10 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white'
          aria-label='缩小'
        >
          <Minus className='h-4 w-4' />
        </button>
        <div className='mx-1 h-6 w-px bg-white/12' />
        <button
          type='button'
          onClick={onZoomIn}
          className='flex h-10 w-10 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white'
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
      className={`earth-panel flex h-10 w-10 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white ${
        active ? 'bg-white/14' : 'bg-white/8'
      }`}
    >
      {children}
    </button>
  )
}
