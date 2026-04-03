'use client'

import { createContext, type PropsWithChildren, useContext, useEffect } from 'react'

import { useMapRuntime, useMapRuntimeSnapshot } from '../hooks/use-map-runtime'
import { useMapShell, type UseMapShellResult } from '../hooks/use-map-shell'
import { useMapShellActions } from '../hooks/use-map-shell-actions'
import type { MapRuntime } from '../services/map-runtime'

interface MapContextValue {
  runtime: MapRuntime
  shell: UseMapShellResult
  actions: ReturnType<typeof useMapShellActions>['actions']
}

const MapContext = createContext<MapContextValue | null>(null)

export function MapProvider({ children }: PropsWithChildren) {
  const runtime = useMapRuntime()
  const snapshot = useMapRuntimeSnapshot()

  useEffect(() => {
    void runtime.syncPreferredBaseMap()
  }, [runtime])

  const shell = useMapShell(snapshot)
  const { actions } = useMapShellActions({ runtime, shell })

  return <MapContext.Provider value={{ runtime, shell, actions }}>{children}</MapContext.Provider>
}

export function useMapContext() {
  const context = useContext(MapContext)

  if (!context) {
    throw new Error('useMapContext must be used within MapProvider')
  }

  return context
}
