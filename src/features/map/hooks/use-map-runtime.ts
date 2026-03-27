'use client'

import { useSyncExternalStore } from 'react'

import { mapRuntime } from '../services/map-runtime'

export function useMapRuntime() {
  return mapRuntime
}

export function useMapRuntimeSnapshot() {
  return useSyncExternalStore(
    (listener) => mapRuntime.subscribe(listener),
    () => mapRuntime.getSnapshot(),
    () => mapRuntime.getSnapshot()
  )
}
