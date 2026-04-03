'use client'

import type { LucideIcon } from 'lucide-react'
import { Eye, EyeOff, FileUp, Layers2, LineSquiggle, MapPin, MoreHorizontal, Ruler, Search, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
        <div className='flex flex-col items-center justify-center gap-2 px-3 py-4 text-xs text-(--module-panel-text-muted)'>
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
                      className='flex h-8 w-8 items-center justify-center rounded-full text-(--module-panel-icon) transition-all duration-200 hover:bg-(--module-button-hover-bg) hover:text-(--module-button-hover-text) active:scale-95 focus-visible:ring-2 focus-visible:ring-neutral-200 dark:focus-visible:ring-neutral-800'
                      aria-label='打开图层操作菜单'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='min-w-[120px] rounded-xl border-neutral-200/60 p-1 shadow-xl dark:border-neutral-800/60' align='end' side='bottom' sideOffset={4}>
                    <DropdownMenuItem
                      className='group cursor-pointer gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-neutral-700 transition-colors focus:bg-neutral-100 focus:text-neutral-900 dark:text-neutral-300 dark:focus:bg-neutral-800 dark:focus:text-neutral-50'
                      onSelect={() => void actions.onFocusLayer(layer.id)}
                    >
                      <Search className='h-[14px] w-[14px] text-neutral-500 transition-colors group-focus:text-neutral-900 dark:text-neutral-400 dark:group-focus:text-neutral-50' />
                      定位图层
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='group cursor-pointer gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-neutral-700 transition-colors focus:bg-neutral-100 focus:text-neutral-900 dark:text-neutral-300 dark:focus:bg-neutral-800 dark:focus:text-neutral-50'
                      onSelect={() => void actions.onToggleLayer(layer.id)}
                    >
                      {layer.visible ? <Eye className='h-[14px] w-[14px] text-neutral-500 transition-colors group-focus:text-neutral-900 dark:text-neutral-400 dark:group-focus:text-neutral-50' /> : <EyeOff className='h-[14px] w-[14px] text-neutral-500 transition-colors group-focus:text-neutral-900 dark:text-neutral-400 dark:group-focus:text-neutral-50' />}
                      {layer.visible ? '隐藏图层' : '显示图层'}
                    </DropdownMenuItem>
                    <div className="my-0.5 h-px bg-neutral-200/50 dark:bg-neutral-800/50" />
                    <DropdownMenuItem
                      className='group cursor-pointer gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-red-600 transition-colors focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-300'
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
