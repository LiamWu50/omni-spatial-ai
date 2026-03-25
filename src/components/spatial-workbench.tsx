'use client'

import { useMemo, useState } from 'react'

import { createActionMeta, defaultBaseMaps } from '@/lib/gis/schema'
import { actionBus } from '@/lib/map/event-bus'

import { ChatPanel } from './chat-panel'
import { EngineSwitcher } from './engine-switcher'
import { FileImporter } from './file-importer'
import { MapCanvas } from './map-canvas'

export function SpatialWorkbench() {
  const [selectedBaseMapId, setSelectedBaseMapId] = useState('streets')
  const baseMaps = useMemo(() => defaultBaseMaps(), [])

  return (
    <div className='grid min-h-screen grid-cols-1 gap-6 bg-slate-950 p-6 text-slate-50 lg:grid-cols-[360px_minmax(0,1fr)]'>
      <aside className='flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-sky-300'>OmniSpatial AI</p>
          <h1 className='mt-2 text-2xl font-semibold'>空间智能操作系统 MVP</h1>
          <p className='mt-2 text-sm leading-6 text-slate-300'>
            统一接入 AI、三地图引擎、GeoJSON 导入与缓冲区分析，验证一套逻辑多引擎驱动的核心架构。
          </p>
        </div>

        <EngineSwitcher />

        <section className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-semibold'>底图策略</h2>
            <span className='text-xs text-slate-400'>统一 BaseMapDescriptor</span>
          </div>
          <div className='mt-3 grid grid-cols-1 gap-2'>
            {Object.values(baseMaps).map((baseMap) => (
              <button
                key={baseMap.id}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedBaseMapId === baseMap.id
                    ? 'border-sky-400 bg-sky-500/10 text-sky-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}
                onClick={() => {
                  setSelectedBaseMapId(baseMap.id)
                  void actionBus.emit({
                    type: 'SWITCH_BASEMAP',
                    payload: {
                      baseMap
                    },
                    meta: createActionMeta('ui')
                  })
                }}
              >
                <div className='font-medium'>{baseMap.name}</div>
                <div className='mt-1 text-xs text-slate-400'>{baseMap.provider}</div>
              </button>
            ))}
          </div>
          <p className='mt-3 text-xs text-slate-400'>
            当前示例已准备 Mapbox / 天地图 / OSM 三套底图描述，控制器按统一协议切换。
          </p>
        </section>

        <FileImporter />
        <ChatPanel selectedBaseMapId={selectedBaseMapId} />
      </aside>

      <MapCanvas />
    </div>
  )
}
