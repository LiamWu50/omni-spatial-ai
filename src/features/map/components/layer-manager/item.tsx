'use client'

import { Eye, EyeOff, FileUp, Search, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { originToLabel } from '../../lib/user-layers'
import type { UserLayerListItem } from '../../types'

interface LayerListItemProps {
  layer: UserLayerListItem
  onToggleLayer: (layerId: string) => Promise<void> | void
  onFocusLayer: (layerId: string) => Promise<void> | void
  onRemoveLayer: (layerId: string) => Promise<void> | void
}

export function Item({ layer, onFocusLayer, onRemoveLayer, onToggleLayer }: LayerListItemProps) {
  return (
    <div className='rounded-[18px] border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] px-3 py-2.5'>
      <div className='flex items-start justify-between gap-2.5'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--module-panel-bg-muted)] text-[var(--module-panel-icon)]'>
              <FileUp className='h-3.5 w-3.5' />
            </div>
            <div className='min-w-0'>
              <div className='truncate text-[13px] font-medium leading-5 text-neutral-900 dark:text-neutral-50'>
                {layer.name}
              </div>
              <div className='text-[11px] leading-4 text-[var(--module-panel-text-muted)]'>
                {layer.featureCount} 个要素 · {formatGeometryLabel(layer.geometryType)}
              </div>
              {layer.summary ? (
                <div className='mt-0.5 text-[11px] leading-4 text-[var(--module-panel-text-muted)]'>
                  {layer.summary}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className='rounded-full bg-[var(--module-panel-bg-muted)] px-2 py-0.5 text-[10px] leading-4 text-[var(--module-panel-text-muted)]'>
          {originToLabel(layer.origin)}
        </div>
      </div>

      <div className='mt-2 flex items-center gap-0.5'>
        <ActionButton
          label='定位图层'
          onClick={() => void onFocusLayer(layer.id)}
          icon={<Search className='h-3.5 w-3.5' />}
        />
        <ActionButton
          label={layer.visible ? '隐藏图层' : '显示图层'}
          onClick={() => void onToggleLayer(layer.id)}
          icon={layer.visible ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
        />
        <ActionButton
          label='删除图层'
          onClick={() => void onRemoveLayer(layer.id)}
          icon={<Trash2 className='h-3.5 w-3.5' />}
          destructive
        />
      </div>
    </div>
  )
}

function ActionButton({
  destructive = false,
  icon,
  label,
  onClick
}: {
  destructive?: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={onClick}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-[var(--module-panel-icon)] transition-[background-color,color] duration-200 hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)]',
            destructive ? 'text-rose-500 hover:bg-rose-500/10 hover:text-rose-500' : ''
          )}
          aria-label={label}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  )
}

function formatGeometryLabel(geometryType: UserLayerListItem['geometryType']) {
  if (geometryType === 'point') {
    return '点'
  }

  if (geometryType === 'line') {
    return '线'
  }

  if (geometryType === 'polygon') {
    return '面'
  }

  return '混合几何'
}
