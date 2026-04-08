'use client'

import { Layers } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { MapTool, ShellToolbarAction } from '../types'
import { UploadDialog } from './upload/upload-dialog'
import { UserAvatarTrigger } from './user-avatar'

interface MapToolbarProps {
  actions: ShellToolbarAction[]
  importStatus: string
  layerManagerOpen: boolean
  onImportLayers: (files: File[]) => Promise<void> | void
  onAction: (actionId: MapTool) => void
  onToggleLayerManager: () => void
}

const mapControlButtonClass = 'shadow-sm shadow-black/10 border border-transparent duration-200 ease-out dark:shadow-black/40 dark:border-neutral-700/30'

const mapControlButtonIdleClass =
  'bg-[#E5E5E5] text-neutral-900 hover:bg-[#D4D4D4] hover:text-neutral-950 dark:bg-[#262626] dark:text-neutral-100 dark:hover:bg-[#2F2F2F] dark:hover:text-neutral-50 dark:border dark:border-neutral-700/50'

const mapControlButtonActiveClass =
  'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground'

export function Toolbar({
  actions,
  importStatus,
  layerManagerOpen,
  onImportLayers,
  onAction,
  onToggleLayerManager
}: MapToolbarProps) {
  return (
    <>
      <div className='pointer-events-none absolute left-5 right-5 top-5 z-30 flex items-start justify-between gap-4'>
        <div className='pointer-events-auto cursor-default flex items-center gap-3'>
          <UserAvatarTrigger />

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              size='icon'
              variant='ghost'
              onClick={onToggleLayerManager}
              title={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
              aria-label={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
              className={cn(
                mapControlButtonClass,
                layerManagerOpen ? mapControlButtonActiveClass : mapControlButtonIdleClass
              )}
            >
              <Layers className='h-3.5 w-3.5' />
            </Button>

            <UploadDialog
              importStatus={importStatus}
              onImportLayers={onImportLayers}
              triggerClassName={cn(mapControlButtonClass, mapControlButtonIdleClass)}
            />

            {actions.map((action) => {
              const Icon = action.icon

              return (
                <Button
                  key={action.id}
                  type='button'
                  size='icon'
                  variant='ghost'
                  onClick={() => onAction(action.id)}
                  title={action.label}
                  className={cn(
                    mapControlButtonClass,
                    action.active ? mapControlButtonActiveClass : mapControlButtonIdleClass
                  )}
                >
                  <Icon className='h-4 w-4' />
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
