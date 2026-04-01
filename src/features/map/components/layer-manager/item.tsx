'use client'

import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff, FileUp, LineSquiggle, MapPin, MoreHorizontal, Ruler, Search, Trash2 } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import type { UserLayerListItem } from '../../types'

interface LayerListItemProps {
  layer: UserLayerListItem
  onToggleLayer: (layerId: string) => Promise<void> | void
  onFocusLayer: (layerId: string) => Promise<void> | void
  onRemoveLayer: (layerId: string) => Promise<void> | void
}

export function Item({ layer, onFocusLayer, onRemoveLayer, onToggleLayer }: LayerListItemProps) {
  const LayerIcon = getLayerIcon(layer)

  return (
    <div className='rounded-[18px] border border-(--module-panel-border) bg-(--module-panel-bg-subtle) px-3 py-2.5'>
      <div className='flex items-start justify-between gap-2.5'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-(--module-panel-bg-muted) text-(--module-panel-icon)'>
              <LayerIcon className='h-3.5 w-3.5' />
            </div>
            <div className='min-w-0'>
              <div className='truncate text-[13px] font-medium leading-5 text-neutral-900 dark:text-neutral-50'>
                {layer.name}
              </div>
              <div className='text-[11px] leading-4 text-(--module-panel-text-muted)'>
                {layer.featureCount} 个要素 · {formatGeometryLabel(layer.geometryType)}
              </div>
              {layer.summary ? (
                <div className='mt-0.5 text-[11px] leading-4 text-(--module-panel-text-muted)'>{layer.summary}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='flex h-7 w-7 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,color] duration-200 hover:bg-(--module-button-hover-bg) hover:text-(--module-button-hover-text)'
                aria-label='打开图层操作菜单'
              >
                <MoreHorizontal className='h-3.5 w-3.5' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='min-w-36 rounded-xl p-1' align='end' side='bottom'>
              <DropdownMenuItem className='cursor-pointer rounded-lg' onSelect={() => void onFocusLayer(layer.id)}>
                <Search className='h-3.5 w-3.5' />
                定位图层
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer rounded-lg' onSelect={() => void onToggleLayer(layer.id)}>
                {layer.visible ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
                {layer.visible ? '隐藏图层' : '显示图层'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className='cursor-pointer rounded-lg'
                variant='destructive'
                onSelect={() => void onRemoveLayer(layer.id)}
              >
                <Trash2 className='h-3.5 w-3.5' />
                删除图层
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function getLayerIcon(layer: UserLayerListItem): LucideIcon {
  if (layer.origin === 'measure') {
    return Ruler
  }

  if (layer.geometryType === 'point') {
    return MapPin
  }

  if (layer.geometryType === 'line' || layer.geometryType === 'polygon' || layer.geometryType === 'mixed') {
    return LineSquiggle
  }

  return FileUp
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
