'use client'

import { Layers3, PanelLeftClose, PanelLeftOpen, Search, Sparkles } from 'lucide-react'

import { Switch } from '@/components/ui/switch'

import type { LayerToggleItem, QuickLocation } from '../types'

interface DrawerProps {
  layers: LayerToggleItem[]
  leftDrawerOpen: boolean
  layerPanelOpen: boolean
  searchOpen: boolean
  visibleLayerCount: number
  quickLocations: QuickLocation[]
  onToggleDrawer: () => void
  onToggleLayerPanel: () => void
  onToggleSearch: () => void
  onToggleLayer: (layerId: string) => void
  onOpenQuickLocation: (locationId: string) => void
}

export function Drawer({
  layers,
  leftDrawerOpen,
  layerPanelOpen,
  searchOpen,
  visibleLayerCount,
  quickLocations,
  onToggleDrawer,
  onToggleLayerPanel,
  onToggleSearch,
  onToggleLayer,
  onOpenQuickLocation
}: DrawerProps) {
  return (
    <>
      <aside
        className={`earth-panel absolute top-24 left-5 z-20 w-[360px] overflow-hidden rounded-[28px] transition-all duration-300 ${
          leftDrawerOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'
        }`}
      >
        <div className='flex items-center justify-between border-b border-white/8 px-5 py-4'>
          <div>
            <div className='text-sm font-semibold text-white'>探索工作台</div>
            <div className='mt-1 text-xs text-white/45'>地图操作与图层入口</div>
          </div>
          <button
            type='button'
            onClick={onToggleDrawer}
            className='flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/8 hover:text-white'
            aria-label='关闭左侧抽屉'
          >
            <PanelLeftClose className='h-4 w-4' />
          </button>
        </div>

        <div className='space-y-4 px-4 py-4'>
          <button
            type='button'
            onClick={onToggleSearch}
            className='flex w-full items-center justify-between rounded-2xl bg-white/7 px-4 py-3 text-left text-white/82 transition hover:bg-white/10'
          >
            <span className='flex items-center gap-3'>
              <Search className='h-4 w-4' />
              <span className='text-sm'>搜索地点、项目、监测对象</span>
            </span>
            <span className='text-xs text-white/45'>{searchOpen ? '收起' : '展开'}</span>
          </button>

          {searchOpen ? (
            <section className='rounded-3xl bg-white/6 p-4'>
              <div className='mb-3 text-xs font-medium tracking-[0.18em] text-white/42'>QUICK ACCESS</div>
              <div className='grid gap-2'>
                {quickLocations.map((location) => (
                  <button
                    key={location.id}
                    type='button'
                    onClick={() => onOpenQuickLocation(location.id)}
                    className='flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/82 transition hover:border-white/14 hover:bg-white/8'
                  >
                    <span>{location.label}</span>
                    <span className='text-xs text-white/45'>飞行</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className='rounded-3xl bg-white/6 p-4'>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={onToggleLayerPanel}
                className='flex items-center gap-2 text-sm font-medium text-white'
              >
                <Layers3 className='h-4 w-4' />
                图层与数据
              </button>
              <span className='text-xs text-white/45'>{visibleLayerCount} 个可见</span>
            </div>

            {layerPanelOpen ? (
              <div className='mt-3 grid gap-2'>
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className='flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-3'
                  >
                    <div className='pr-3'>
                      <div className='text-sm text-white'>{layer.name}</div>
                      <div className='mt-1 text-xs text-white/45'>{layer.description ?? layer.id}</div>
                    </div>
                    <Switch checked={layer.visible} onCheckedChange={() => onToggleLayer(layer.id)} />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className='rounded-3xl bg-white/6 p-4'>
            <div className='flex items-center gap-2 text-sm font-medium text-white'>
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

      {!leftDrawerOpen ? (
        <button
          type='button'
          onClick={onToggleDrawer}
          className='earth-panel absolute top-28 left-5 z-20 flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition hover:bg-white/12 hover:text-white'
          aria-label='打开左侧抽屉'
        >
          <PanelLeftOpen className='h-4 w-4' />
        </button>
      ) : null}
    </>
  )
}

function SuggestionCard({ description, title }: { description: string; title: string }) {
  return (
    <div className='rounded-2xl border border-white/8 bg-black/18 px-4 py-3'>
      <div className='text-sm font-medium text-white'>{title}</div>
      <div className='mt-1 text-xs leading-5 text-white/48'>{description}</div>
    </div>
  )
}
