'use client'

import { Layers } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { ShellToolbarAction } from '../types'
import { UserAvatarTrigger } from './user/user-avatar-trigger'

interface MapToolbarProps {
  actions: ShellToolbarAction[]
  layerManagerOpen: boolean
  onAction: (actionId: string) => void
  onToggleLayerManager: () => void
}

export function Toolbar({ actions, layerManagerOpen, onAction, onToggleLayerManager }: MapToolbarProps) {
  return (
    <div className='pointer-events-none absolute left-5 right-5 top-5 z-30 flex items-start justify-between gap-4'>
      <div className='pointer-events-auto flex items-center gap-3'>
        <UserAvatarTrigger />

        <div className='flex h-10 items-center gap-3 rounded-full border border-neutral-200/90 bg-white/90 px-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-neutral-800/90 dark:bg-neutral-950/90 dark:shadow-[0_10px_30px_rgba(0,0,0,0.32)]'>
          <button
            type='button'
            onClick={onToggleLayerManager}
            title={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
            aria-label={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white',
              layerManagerOpen
                ? 'bg-neutral-900 text-neutral-50 shadow-[inset_0_0_0_1px_rgba(38,38,38,0.16)] dark:bg-neutral-800 dark:shadow-[inset_0_0_0_1px_rgba(64,64,64,0.9)]'
                : ''
            )}
          >
            <Layers className='h-3.5 w-3.5' />
          </button>

          {actions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.id}
                type='button'
                onClick={() => onAction(action.id)}
                title={action.label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white',
                  action.active
                    ? 'bg-neutral-900 text-neutral-50 shadow-[inset_0_0_0_1px_rgba(38,38,38,0.16)] dark:bg-neutral-800 dark:shadow-[inset_0_0_0_1px_rgba(64,64,64,0.9)]'
                    : ''
                )}
              >
                <Icon className='h-4 w-4' />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
