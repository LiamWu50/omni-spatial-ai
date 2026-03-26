'use client'

import { Layers3, PanelLeftClose, PanelLeftOpen, Search, Sparkles } from 'lucide-react'

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
    <>
      <aside
        className={`earth-panel absolute left-5 top-24 z-20 w-[360px] overflow-hidden rounded-[28px] transition-all duration-300 ${
          layerManagerOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'
        }`}
      >
        <div className='flex items-center justify-between border-b border-neutral-800 px-5 py-4'>
          <div>
            <div className='text-sm font-semibold text-neutral-50'>探索工作台</div>
            <div className='mt-1 text-xs text-neutral-400'>地图操作与图层入口</div>
          </div>
          <button
            type='button'
            onClick={onToggleLayerManager}
            className='flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-50'
            aria-label='关闭图层管理面板'
          >
            <PanelLeftClose className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-4 px-4 py-4'>
          <button
            type='button'
            onClick={onToggleSearch}
            className='flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-left text-neutral-100 transition hover:bg-neutral-800'
          >
            <span className='flex items-center gap-3'>
              <Search className='h-4 w-4' />
              <span className='text-sm'>搜索地点、项目、监测对象</span>
            </span>
            <span className='text-xs text-neutral-400'>{searchOpen ? '收起' : '展开'}</span>
          </button>

          {searchOpen ? (
            <section className='rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4'>
              <div className='mb-3 text-xs font-medium tracking-[0.18em] text-neutral-400'>QUICK ACCESS</div>
              <div className='grid gap-2'>
                {quickLocations.map((location) => (
                  <button
                    key={location.id}
                    type='button'
                    onClick={() => onOpenQuickLocation(location.id)}
                    className='flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-100 transition hover:border-neutral-700 hover:bg-neutral-800'
                  >
                    <span>{location.label}</span>
                    <span className='text-xs text-neutral-400'>飞行</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className='rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4'>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={onToggleLayerList}
                className='flex items-center gap-2 text-sm font-medium text-neutral-50'
              >
                <Layers3 className='h-4 w-4' />
                图层与数据
              </button>
              <span className='text-xs text-neutral-400'>{visibleLayerCount} 个可见</span>
            </div>

            {layerListOpen ? (
              <div className='mt-3 grid gap-2'>
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className='flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 px-3 py-3'
                  >
                    <div className='pr-3'>
                      <div className='text-sm text-neutral-50'>{layer.name}</div>
                      <div className='mt-1 text-xs text-neutral-400'>{layer.description ?? layer.id}</div>
                    </div>
                    <Switch checked={layer.visible} onCheckedChange={() => onToggleLayer(layer.id)} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className='rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4'>
            <div className='flex items-center gap-2 text-sm font-medium text-neutral-50'>
              <Sparkles className='h-4 w-4' />
              今日建议
            </div>
            <div className='mt-3 grid gap-2'>
              <SuggestionCard title='查看延榆六标项目' description='聚焦桥梁、边坡与沉降监测对象分布。' />
              <SuggestionCard title='切换地形观察模式' description='提高起伏地形与走廊风险的空间感知。' />
            </div>
          </section>
        </div>
      </aside>

      {!layerManagerOpen ? (
        <button
          type='button'
          onClick={onToggleLayerManager}
          className='earth-panel absolute left-5 top-28 z-20 flex h-12 w-12 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-50'
          aria-label='打开图层管理面板'
        >
          <PanelLeftOpen className='h-4 w-4' />
        </button>
      ) : null}
    </>
  )
}

function SuggestionCard({ description, title }: { description: string; title: string }) {
  return (
    <div className='rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3'>
      <div className='text-sm font-medium text-neutral-50'>{title}</div>
      <div className='mt-1 text-xs leading-5 text-neutral-400'>{description}</div>
    </div>
  )
}
