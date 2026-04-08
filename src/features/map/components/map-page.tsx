'use client'

import { useEffect, useRef } from 'react'

import { AssistantEntry } from '@/features/assistant/components/entry'
import { AssistantPanel } from '@/features/assistant/components/panel'
import { MapAssistantProvider } from '@/features/assistant/provider'

import { BaseLayer } from './base-layer'
import { LayerManagerPanel } from './layer-manager/panel'
import { MapProvider, useMapContext } from './map-provider'
import { Nav } from './nav'
import { Status } from './status-bar'
import { Toolbar } from './toolbar'

function MapPageInner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { runtime, shell, actions: mapActions } = useMapContext()
  const { actions: shellActions, derived, state } = shell

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let cleanup: (() => void) | undefined

    void runtime.mount(container).then((nextCleanup) => {
      cleanup = nextCleanup
    })

    return () => {
      cleanup?.()
    }
  }, [runtime])

  return (
    <MapAssistantProvider>
      <div className='relative h-screen w-full overflow-hidden text-neutral-900 dark:text-white'>
        <div className='absolute inset-0 flex h-full w-full overflow-hidden'>
          <div className='relative h-full min-w-0 flex-1 overflow-hidden'>
            <section className='pointer-events-none absolute inset-0 overflow-hidden'>
              <div ref={containerRef} className='pointer-events-auto absolute inset-0 z-0' />
              <BaseLayer activeBaseLayer={state.activeBaseLayer} onChange={mapActions.switchBaseLayer} />
            </section>

            <Toolbar
              actions={derived.toolbarActions}
              importStatus={state.importStatus}
              layerManagerOpen={state.panels.layerManagerOpen}
              onImportLayers={shellActions.importLayers}
              onAction={mapActions.toolbarAction}
              onToggleLayerManager={mapActions.toggleLayerManager}
            />

            <LayerManagerPanel
              open={state.panels.layerManagerOpen}
              data={{
                layers: derived.layers
              }}
              actions={{
                onToggle: mapActions.toggleLayerManager,
                onToggleLayer: shellActions.toggleLayer,
                onFocusLayer: shellActions.focusLayer,
                onRemoveLayer: shellActions.removeLayer
              }}
            />

            <AssistantEntry visible={!state.panels.assistantPanelOpen} onOpen={mapActions.openAssistantPanel} />

            <Nav
              onLocate={mapActions.locate}
              onResetView={mapActions.resetView}
              onZoomIn={mapActions.zoomIn}
              onZoomOut={mapActions.zoomOut}
            />

            <Status state={derived.statusBar} />
          </div>

          <AssistantPanel open={state.panels.assistantPanelOpen} onOpenChange={mapActions.assistantPanelChange} />
        </div>
      </div>
    </MapAssistantProvider>
  )
}

export function MapPage() {
  return (
    <MapProvider>
      <MapPageInner />
    </MapProvider>
  )
}
