'use client'

import { useSyncExternalStore } from 'react'

import { mapBridge } from '../helps/map-bridge-service'

export function useMapBridge() {
  return mapBridge
}

export function useMapSnapshot() {
  return useSyncExternalStore(
    (listener) => mapBridge.subscribe(listener),
    () => mapBridge.getSnapshot(),
    () => mapBridge.getSnapshot()
  )
}
