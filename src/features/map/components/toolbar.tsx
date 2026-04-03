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

const mapControlButtonClass =
  'shadow-sm shadow-black/10 duration-200 ease-out bg-[#E5E5E5] text-neutral-900 hover:bg-[#D4D4D4] hover:text-neutral-950 dark:shadow-black/30 dark:bg-[#0A0A0A] dark:text-neutral-100 dark:hover:bg-[#171717] dark:hover:text-neutral-50'

const mapControlButtonActiveClass =
  'shadow-sm shadow-black/10 duration-200 ease-out dark:shadow-black/30 bg-(--module-button-active-bg) text-(--module-button-active-text) hover:bg-(--module-button-active-bg) hover:text-(--module-button-active-text)'

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
        <div className='pointer-events-auto flex items-center gap-3'>
          <UserAvatarTrigger />

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              size='icon'
              variant='secondary'
              onClick={onToggleLayerManager}
              title={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
              aria-label={layerManagerOpen ? '收起图层工作台' : '打开图层工作台'}
              className={cn(mapControlButtonClass, layerManagerOpen && mapControlButtonActiveClass)}
            >
              <Layers className='h-3.5 w-3.5' />
            </Button>

            <UploadDialog
              importStatus={importStatus}
              onImportLayers={onImportLayers}
              triggerClassName={mapControlButtonClass}
            />

            {actions.map((action) => {
              const Icon = action.icon

              return (
                <Button
                  key={action.id}
                  type='button'
                  size='icon'
                  variant='secondary'
                  onClick={() => onAction(action.id)}
                  title={action.label}
                  className={cn(mapControlButtonClass, action.active && mapControlButtonActiveClass)}
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
