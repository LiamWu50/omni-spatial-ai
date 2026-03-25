'use client'

import { useSyncExternalStore } from 'react'

import type { EngineType } from '@/lib/gis/schema'

import { mapRuntimeBridge } from './map-canvas'

const engineOptions: EngineType[] = ['mapbox', 'cesium', 'leaflet']

export function EngineSwitcher() {
  const state = useSyncExternalStore(
    mapRuntimeBridge.subscribe,
    mapRuntimeBridge.getSnapshot,
    mapRuntimeBridge.getSnapshot
  )

  return (
    <section className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold'>引擎调度</h2>
        <span className='text-xs text-slate-400'>IMapEngine</span>
      </div>
      <div className='mt-3 grid grid-cols-3 gap-2'>
        {engineOptions.map((engine) => (
          <button
            key={engine}
            onClick={() => void mapRuntimeBridge.switchEngine(engine)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              state.activeEngine === engine
                ? 'border-violet-400 bg-violet-500/10 text-violet-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            {engine}
          </button>
        ))}
      </div>
      <p className='mt-3 text-xs leading-5 text-slate-400'>
        切换时会保留当前视图、已加载图层与底图状态，模拟 2D/3D 无缝衔接。
      </p>
    </section>
  )
}
