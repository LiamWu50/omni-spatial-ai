'use client'

import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff, FileUp, LineSquiggle, MapPin, MoreHorizontal, Ruler, Search, Trash2 } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Item as BaseItem, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

import type { UserLayerListItem } from '../../types'
import type { LayerManagerActions, LayerManagerData } from './types'

interface ListProps {
  data: Pick<LayerManagerData, 'layers'>
  actions: Pick<LayerManagerActions, 'onToggleLayer' | 'onFocusLayer' | 'onRemoveLayer'>
}

export function List({ actions, data }: ListProps) {
  const { layers } = data

  if (layers.length === 0) {
    return (
      <section>
        <div className='flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-neutral-200/80 bg-neutral-50/70 px-3 py-4 text-xs text-(--module-panel-text-muted) dark:border-white/10 dark:bg-white/2'>
          <FileUp className='size-3.5 text-(--module-panel-icon)' />
          <span>暂无图层数据</span>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className='space-y-2'>
        {layers.map((layer) => {
          const LayerIcon = getLayerIcon(layer)

          return (
            <BaseItem
              key={layer.id}
              className='flex-nowrap gap-2.5 rounded-[18px] border-0 bg-neutral-100/85 px-3 py-2.5 dark:bg-white/2'
            >
              <ItemMedia
                variant='icon'
                className='size-8 rounded-lg border-none bg-neutral-200/80 text-(--module-panel-icon) dark:bg-white/2'
              >
                <LayerIcon className='size-3.5' />
              </ItemMedia>

              <ItemContent className='min-w-0 flex-1 gap-0'>
                <ItemTitle className='min-w-0 text-[13px] leading-5 text-neutral-900 dark:text-neutral-50'>
                  <span className='block truncate'>{layer.name}</span>
                </ItemTitle>
                <ItemDescription className='text-[11px] leading-4 text-(--module-panel-text-muted)'>
                  {layer.featureCount} 个要素 · {formatGeometryLabel(layer.geometryType)}
                </ItemDescription>
              </ItemContent>

              <ItemActions className='shrink-0 self-center gap-1'>
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
                    <DropdownMenuItem
                      className='cursor-pointer rounded-lg'
                      onSelect={() => void actions.onFocusLayer(layer.id)}
                    >
                      <Search className='h-3.5 w-3.5' />
                      定位图层
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='cursor-pointer rounded-lg'
                      onSelect={() => void actions.onToggleLayer(layer.id)}
                    >
                      {layer.visible ? <Eye className='h-3.5 w-3.5' /> : <EyeOff className='h-3.5 w-3.5' />}
                      {layer.visible ? '隐藏图层' : '显示图层'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='cursor-pointer rounded-lg'
                      variant='destructive'
                      onSelect={() => void actions.onRemoveLayer(layer.id)}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                      删除图层
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemActions>
            </BaseItem>
          )
        })}
      </div>
    </section>
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
