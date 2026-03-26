'use client'

import { Layers3, Search, Sparkles, X } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'

import type { LayerToggleItem, QuickLocation } from '../../types'

interface LayerManagerPanelProps {
  layers: LayerToggleItem[]
  layerManagerOpen: boolean
  layerListOpen: boolean
  searchOpen: boolean
  visibleLayerCount: number
  quickLocations: QuickLocation[]
  onToggleLayerManager: () => void
  onToggleLayerList: () => void
  onToggleSearch: () => void
  onToggleLayer: (layerId: string) => void
  onOpenQuickLocation: (locationId: string) => void
}

export function LayerManagerPanel({
  layers,
  layerManagerOpen,
  layerListOpen,
  searchOpen,
  visibleLayerCount,
  quickLocations,
  onToggleLayerManager,
  onToggleLayerList,
  onToggleSearch,
  onToggleLayer,
  onOpenQuickLocation
}: LayerManagerPanelProps) {
  return (
    <aside
      className={`absolute left-5 top-24 z-20 flex max-h-[calc(100vh-7rem)] w-[360px] flex-col overflow-hidden rounded-[28px] border border-neutral-200/90 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 dark:border-neutral-800/90 dark:bg-neutral-950/90 dark:shadow-[0_10px_30px_rgba(0,0,0,0.32)] ${
        layerManagerOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'
      }`}
    >
      <div className='flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800'>
        <div>
          <div className='text-sm font-semibold text-neutral-900 dark:text-neutral-50'>探索工作台</div>
          <div className='mt-1 text-xs text-neutral-500 dark:text-neutral-400'>地图操作与图层入口</div>
        </div>
        <button
          type='button'
          onClick={onToggleLayerManager}
          className='flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white'
          aria-label='关闭图层管理面板'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <ScrollArea className='min-h-0 flex-1'>
        <div className='space-y-4 px-4 py-4'>
          <button
            type='button'
            onClick={onToggleSearch}
            className='flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 text-left text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:bg-neutral-800'
          >
            <span className='flex items-center gap-3'>
              <Search className='h-4 w-4' />
              <span className='text-sm'>搜索地点、项目、监测对象</span>
            </span>
            <span className='text-xs text-neutral-500 dark:text-neutral-400'>{searchOpen ? '收起' : '展开'}</span>
          </button>

          {searchOpen ? (
            <section className='rounded-3xl border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-950/70'>
              <div className='mb-3 text-xs font-medium tracking-[0.18em] text-neutral-500 dark:text-neutral-400'>
                QUICK ACCESS
              </div>
              <div className='grid gap-2'>
                {quickLocations.map((location) => (
                  <button
                    key={location.id}
                    type='button'
                    onClick={() => onOpenQuickLocation(location.id)}
                    className='flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-100 dark:hover:border-neutral-700 dark:hover:bg-neutral-800'
                  >
                    <span>{location.label}</span>
                    <span className='text-xs text-neutral-500 dark:text-neutral-400'>飞行</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className='rounded-3xl border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-950/70'>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={onToggleLayerList}
                className='flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-50'
              >
                <Layers3 className='h-4 w-4' />
                图层与数据
              </button>
              <span className='text-xs text-neutral-500 dark:text-neutral-400'>{visibleLayerCount} 个可见</span>
            </div>

            {layerListOpen ? (
              <div className='mt-3 grid gap-2'>
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className='flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50/80 px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900/60'
                  >
                    <div className='pr-3'>
                      <div className='text-sm text-neutral-900 dark:text-neutral-50'>{layer.name}</div>
                      <div className='mt-1 text-xs text-neutral-500 dark:text-neutral-400'>
                        {layer.description ?? layer.id}
                      </div>
                    </div>
                    <Switch checked={layer.visible} onCheckedChange={() => onToggleLayer(layer.id)} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className='rounded-3xl border border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-950/70'>
            <div className='flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-50'>
              <Sparkles className='h-4 w-4' />
              今日建议
            </div>
            <div className='mt-3 grid gap-2'>
              <SuggestionCard title='查看延榆六标项目' description='聚焦桥梁、边坡与沉降监测对象分布。' />
              <SuggestionCard title='切换地形观察模式' description='提高起伏地形与走廊风险的空间感知。' />
            </div>
          </section>
        </div>
      </ScrollArea>
    </aside>
  )
}

function SuggestionCard({ description, title }: { description: string; title: string }) {
  return (
    <div className='rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/60'>
      <div className='text-sm font-medium text-neutral-900 dark:text-neutral-50'>{title}</div>
      <div className='mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400'>{description}</div>
    </div>
  )
}
