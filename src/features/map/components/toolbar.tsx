'use client'

import { Layers } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { MapTool, ShellToolbarAction } from '../types'
import { UserAvatarTrigger } from './user/user-avatar-trigger'

interface MapToolbarProps {
  actions: ShellToolbarAction[]
  layerManagerOpen: boolean
  onAction: (actionId: MapTool) => void
  onToggleLayerManager: () => void
}

export function Toolbar({ actions, layerManagerOpen, onAction, onToggleLayerManager }: MapToolbarProps) {
  return (
    <div className='pointer-events-none absolute left-5 right-5 top-5 z-30 flex items-start justify-between gap-4'>
      <div className='pointer-events-auto flex items-center gap-3'>
        <UserAvatarTrigger />

        <div className='flex items-center gap-1 rounded-full p-1 border border-(--module-panel-border) bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px]'>
          <button
            type='button'
            onClick={onToggleLayerManager}
            title={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
            aria-label={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,border-color,color,box-shadow] duration-180 hover:bg-(--module-button-hover-bg) hover:text-(--module-button-hover-text)',
              layerManagerOpen
                ? 'bg-(--module-button-active-bg) text-(--module-button-active-text) shadow-(--module-button-active-ring)'
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
                  'flex h-9 w-9 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,border-color,color,box-shadow] duration-180 hover:bg-(--module-button-hover-bg) hover:text-(--module-button-hover-text)',
                  action.active
                    ? 'bg-(--module-button-active-bg) text-(--module-button-active-text) shadow-(--module-button-active-ring)'
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
