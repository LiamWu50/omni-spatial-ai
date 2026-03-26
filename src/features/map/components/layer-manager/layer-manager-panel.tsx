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
      className={`absolute left-5 top-24 z-20 flex max-h-[calc(100vh-7rem)] w-[360px] flex-col overflow-hidden rounded-[28px] border border-[var(--module-panel-border)] bg-[var(--module-panel-bg)] shadow-[var(--module-panel-shadow)] backdrop-blur-[20px] transition-all duration-300 ${
        layerManagerOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'
      }`}
    >
      <div className='flex items-center justify-between border-b border-[var(--module-panel-border)] px-5 py-4'>
        <div>
          <div className='text-sm font-semibold text-neutral-900 dark:text-neutral-50'>探索工作台</div>
          <div className='mt-1 text-xs text-[var(--module-panel-text-muted)]'>地图操作与图层入口</div>
        </div>
        <button
          type='button'
          onClick={onToggleLayerManager}
          className='flex h-9 w-9 items-center justify-center rounded-full text-[var(--module-panel-icon)] transition-[background-color,border-color,color,box-shadow] duration-[180ms] hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)]'
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
            className='flex w-full items-center justify-between rounded-2xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] px-4 py-3 text-left text-[var(--module-panel-text)] transition-[background-color,border-color,color] duration-[180ms] hover:border-[var(--module-panel-border-strong)] hover:bg-[var(--module-button-hover-bg)]'
          >
            <span className='flex items-center gap-3'>
              <Search className='h-4 w-4' />
              <span className='text-sm'>搜索地点、项目、监测对象</span>
            </span>
            <span className='text-xs text-[var(--module-panel-text-muted)]'>{searchOpen ? '收起' : '展开'}</span>
          </button>

          {searchOpen ? (
            <section className='rounded-3xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] p-4'>
              <div className='mb-3 text-xs font-medium tracking-[0.18em] text-[var(--module-panel-text-muted)]'>
                QUICK ACCESS
              </div>
              <div className='grid gap-2'>
                {quickLocations.map((location) => (
                  <button
                    key={location.id}
                    type='button'
                    onClick={() => onOpenQuickLocation(location.id)}
                    className='flex items-center justify-between rounded-2xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-muted)] px-4 py-3 text-sm text-[var(--module-panel-text)] transition-[background-color,border-color,color] duration-[180ms] hover:border-[var(--module-panel-border-strong)] hover:bg-[var(--module-button-hover-bg)]'
                  >
                    <span>{location.label}</span>
                    <span className='text-xs text-[var(--module-panel-text-muted)]'>飞行</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className='rounded-3xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] p-4'>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={onToggleLayerList}
                className='flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-50'
              >
                <Layers3 className='h-4 w-4' />
                图层与数据
              </button>
              <span className='text-xs text-[var(--module-panel-text-muted)]'>{visibleLayerCount} 个可见</span>
            </div>

            {layerListOpen ? (
              <div className='mt-3 grid gap-2'>
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className='flex items-center justify-between rounded-2xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-muted)] px-3 py-3'
                  >
                    <div className='pr-3'>
                      <div className='text-sm text-neutral-900 dark:text-neutral-50'>{layer.name}</div>
                      <div className='mt-1 text-xs text-[var(--module-panel-text-muted)]'>
                        {layer.description ?? layer.id}
                      </div>
                    </div>
                    <Switch checked={layer.visible} onCheckedChange={() => onToggleLayer(layer.id)} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className='rounded-3xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] p-4'>
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
    <div className='rounded-2xl border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-muted)] px-4 py-3'>
      <div className='text-sm font-medium text-neutral-900 dark:text-neutral-50'>{title}</div>
      <div className='mt-1 text-xs leading-5 text-[var(--module-panel-text-muted)]'>{description}</div>
    </div>
  )
}
