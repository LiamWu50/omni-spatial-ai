'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { defaultBaseMaps, type EngineType } from '@/lib/gis/schema'
import { CesiumAdapter } from '@/lib/map/adapters/cesium'
import { LeafletAdapter } from '@/lib/map/adapters/leaflet'
import { MapboxAdapter } from '@/lib/map/adapters/mapbox'
import { MapController } from '@/lib/map/controller'
import { actionBus } from '@/lib/map/event-bus'

const controller = new MapController({
  engines: {
    mapbox: new MapboxAdapter(),
    cesium: new CesiumAdapter(),
    leaflet: new LeafletAdapter()
  },
  initialEngine: 'mapbox',
  initialBaseMap: defaultBaseMaps().streets
})

let runtimeSnapshot = controller.store.getState()
const runtimeListeners = new Set<() => void>()

controller.store.subscribe((state) => {
  runtimeSnapshot = state
  runtimeListeners.forEach((listener) => listener())
})

export const mapRuntimeBridge = {
  getSnapshot: () => runtimeSnapshot,
  subscribe(listener: () => void) {
    runtimeListeners.add(listener)
    return () => runtimeListeners.delete(listener)
  },
  switchEngine(engine: EngineType) {
    return controller.switchEngine(engine)
  }
}

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const state = useSyncExternalStore(
    mapRuntimeBridge.subscribe,
    mapRuntimeBridge.getSnapshot,
    mapRuntimeBridge.getSnapshot
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    void controller.mount(container)

    const unsubscribe = actionBus.subscribe(async (action) => {
      await controller.dispatch(action)
    })

    return () => {
      unsubscribe()
      void controller.unmount()
    }
  }, [])

  return (
    <section className='grid min-h-[80vh] grid-rows-[minmax(0,1fr)_auto] gap-4'>
      <div
        ref={containerRef}
        className='min-h-[560px] rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30'
      />
      <div className='grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 lg:grid-cols-4'>
        <MetricCard label='活动引擎' value={state.activeEngine} />
        <MetricCard
          label='当前中心'
          value={`${state.view.center.lng.toFixed(3)}, ${state.view.center.lat.toFixed(3)}`}
        />
        <MetricCard label='缩放等级' value={state.view.zoom.toFixed(2)} />
        <MetricCard label='图层数量' value={String(state.layers.length)} />
      </div>
      {state.lastError ? (
        <div className='rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100'>
          地图错误：{state.lastError}
        </div>
      ) : null}
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
      <div className='text-xs uppercase tracking-[0.2em] text-slate-400'>{label}</div>
      <div className='mt-2 text-lg font-semibold text-white'>{value}</div>
    </div>
  )
}
