'use client'

import { Layers3, X } from 'lucide-react'

import { ScrollArea } from '@/components/ui/scroll-area'

import { List } from './list'
import type { LayerManagerActions, LayerManagerData } from './types'

interface LayerManagerPanelProps {
  open: boolean
  data: LayerManagerData
  actions: LayerManagerActions
}

export function LayerManagerPanel({ actions, data, open }: LayerManagerPanelProps) {
  return (
    <aside
      className={`pointer-events-none absolute left-5 top-24 z-20 flex max-h-[calc(100vh-7rem)] w-[300px] flex-col overflow-hidden rounded-0 border border-border bg-card transition-all duration-300 ${
        open ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'
      }`}
    >
      <div className='pointer-events-auto cursor-default flex h-full flex-col'>
      <div className='flex items-center justify-between border-b border-border p-4'>
        <div className='flex-1 text-left'>
          <div className='flex items-center gap-2 text-sm font-semibold text-foreground font-display uppercase tracking-[0.14em]'>
            <span className='flex h-7 w-7 items-center justify-center rounded-0 bg-surface-subtle text-foreground'>
              <Layers3 className='h-4 w-4' />
            </span>
            <span>图层管理</span>
          </div>
        </div>
        <button
          type='button'
          onClick={actions.onToggle}
          className='flex h-9 w-9 items-center justify-center rounded-0 text-text-secondary transition-colors duration-180 hover:bg-surface-hover hover:opacity-50'
          aria-label='关闭图层管理面板'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <ScrollArea className='min-h-0 flex-1'>
        <div className='px-4 py-4'>
          <List data={data} actions={actions} />
        </div>
      </ScrollArea>
      </div>
    </aside>
  )
}
