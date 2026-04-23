'use client'

import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff, FileUp, Layers2, LineSquiggle, MapPin, MoreHorizontal, Ruler, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
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
        <div className='flex flex-col items-center justify-center gap-2 px-3 py-4 text-xs text-text-muted font-body'>
          <Button size='icon-sm' variant='secondary'>
            <Layers2 />
          </Button>
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
              className='flex-nowrap gap-2.5 rounded-0 border border-border bg-surface-subtle px-3 py-2.5'
            >
              <ItemMedia
                variant='icon'
                className='size-8 rounded-0 border-none bg-surface-hover text-text-secondary'
              >
                <LayerIcon className='size-3.5' />
              </ItemMedia>

              <ItemContent className='min-w-0 flex-1 gap-0'>
                <ItemTitle className='min-w-0 text-xs leading-5 text-foreground font-body'>
                  <span className='block truncate'>{layer.name}</span>
                </ItemTitle>
                <ItemDescription className='text-[11px] leading-4 text-text-muted font-body'>
                  {layer.featureCount} 个要素 · {formatGeometryLabel(layer.geometryType)}
                </ItemDescription>
              </ItemContent>

              <ItemActions className='shrink-0 self-center gap-1'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='flex h-8 w-8 items-center justify-center rounded-0 text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:opacity-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/50'
                      aria-label='打开图层操作菜单'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className='min-w-[120px] rounded-0 border border-border p-1'
                    align='end'
                    side='bottom'
                    sideOffset={4}
                  >
                    <DropdownMenuItem
                      onSelect={() => void actions.onFocusLayer(layer.id)}
                    >
                      <Search className='h-[14px] w-[14px]' />
                      定位图层
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => void actions.onToggleLayer(layer.id)}
                    >
                      {layer.visible ? (
                        <Eye className='h-[14px] w-[14px]' />
                      ) : (
                        <EyeOff className='h-[14px] w-[14px]' />
                      )}
                      {layer.visible ? '隐藏图层' : '显示图层'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant='destructive'
                      onSelect={() => void actions.onRemoveLayer(layer.id)}
                    >
                      <Trash2 className='h-[14px] w-[14px] text-red-600 transition-colors group-focus:text-red-700 dark:text-red-400 dark:group-focus:text-red-300' />
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
