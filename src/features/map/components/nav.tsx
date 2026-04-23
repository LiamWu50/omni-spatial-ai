'use client'

import { Crosshair, Home, Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MapNavProps {
  onLocate: () => void
  onResetView: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

const mapControlButtonClass = 'border border-border duration-200 ease-out !rounded-[4px]'

const mapControlButtonIdleClass =
  'bg-surface-subtle text-foreground hover:bg-surface-hover'

const mapControlButtonActiveClass =
  'bg-brand-green text-brand-green-foreground hover:bg-brand-green-hover'

export function Nav({ onLocate, onResetView, onZoomIn, onZoomOut }: MapNavProps) {
  return (
    <div className='pointer-events-none absolute bottom-12 right-4 z-30 flex items-center gap-2'>
      <div className='pointer-events-auto cursor-default flex items-center gap-2'>
        <NavActionButton label='定位' onClick={onLocate}>
          <Crosshair className='h-4 w-4' />
        </NavActionButton>
        <NavActionButton label='重置视角' onClick={onResetView}>
          <Home className='h-4 w-4' />
        </NavActionButton>
        <div className='flex items-center overflow-hidden rounded-[4px] border border-border'>
          <NavActionButton label='缩小' onClick={onZoomOut} grouped>
            <Minus className='h-4 w-4' />
          </NavActionButton>
          <NavActionButton label='放大' onClick={onZoomIn} grouped>
            <Plus className='h-4 w-4' />
          </NavActionButton>
        </div>
      </div>
    </div>
  )
}

function NavActionButton({
  active,
  children,
  grouped,
  label,
  onClick
}: {
  active?: boolean
  children: ReactNode
  grouped?: boolean
  label: string
  onClick?: () => void
}) {
  return (
    <Button
      type='button'
      size='icon'
      variant='ghost'
      onClick={onClick}
      aria-label={label}
      className={cn(
        mapControlButtonClass,
        active ? mapControlButtonActiveClass : mapControlButtonIdleClass,
        grouped && 'shadow-none first:rounded-r-none first:rounded-l-0 last:rounded-l-none last:rounded-r-0 first:border-r first:border-border'
      )}
    >
      {children}
    </Button>
  )
}
