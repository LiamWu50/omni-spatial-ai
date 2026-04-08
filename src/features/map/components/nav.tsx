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

const mapControlButtonClass = 'shadow-sm shadow-black/10 border border-transparent duration-200 ease-out dark:shadow-black/40 dark:border-neutral-700/30'

const mapControlButtonIdleClass =
  'bg-[#E5E5E5] text-neutral-900 hover:bg-[#D4D4D4] hover:text-neutral-950 dark:bg-[#262626] dark:text-neutral-100 dark:hover:bg-[#2F2F2F] dark:hover:text-neutral-50 dark:border dark:border-neutral-700/50'

const mapControlButtonActiveClass =
  'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground'

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
        <div className='flex items-center overflow-hidden rounded-md shadow-sm shadow-black/10 dark:shadow-black/30'>
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
        grouped && 'shadow-none first:rounded-r-none first:rounded-l-md last:rounded-l-none last:rounded-r-md first:border-r first:border-border dark:first:border-neutral-700/50'
      )}
    >
      {children}
    </Button>
  )
}
