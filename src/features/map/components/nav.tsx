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

      <div className='flex h-10 items-center rounded-full border border-(--module-panel-border) bg-(--module-panel-bg) px-1 shadow-(--module-panel-shadow) backdrop-blur-[20px]'>
        <button
          type='button'
          onClick={onZoomOut}
          className='flex h-10 w-10 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,border-color,color,box-shadow] duration-[180ms] hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)]'
          aria-label='缩小'
        >
          <Minus className='h-4 w-4' />
        </button>
        <div className='mx-1 h-6 w-px bg-(--module-panel-border)' />
        <button
          type='button'
          onClick={onZoomIn}
          className='flex h-10 w-10 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,border-color,color,box-shadow] duration-[180ms] hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)]'
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
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-[var(--module-panel-border)] bg-[var(--module-panel-bg)] text-[var(--module-panel-icon)] shadow-[var(--module-panel-shadow)] backdrop-blur-[20px] transition-[background-color,border-color,color,box-shadow] duration-[180ms] hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)] ${
        active
          ? 'bg-[var(--module-button-active-bg)] text-[var(--module-button-active-text)] shadow-[var(--module-button-active-ring)]'
          : ''
      }`}
    >
      {children}
    </button>
  )
}
