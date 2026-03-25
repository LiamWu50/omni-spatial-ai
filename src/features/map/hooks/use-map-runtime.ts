'use client'

import { type RefObject, useEffect, useSyncExternalStore } from 'react'

import { mapBridge } from '../lib/map-bridge'

export function useMapBridge() {
  return mapBridge
}

export function useMapSnapshot() {
  return useSyncExternalStore(mapBridge.subscribe, mapBridge.getSnapshot, mapBridge.getSnapshot)
}

export function useMapRuntime(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    return mapBridge.mount(container)
  }, [containerRef])
}
