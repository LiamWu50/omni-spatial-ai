'use client'

import { useEffect, useRef } from 'react'

import { AssistantEntry } from '@/features/assistant/components/entry'
import { AssistantPanel } from '@/features/assistant/components/panel'
import { MapAssistantProvider } from '@/features/assistant/provider'
import { useMapRuntime, useMapRuntimeSnapshot } from '../hooks/use-map-runtime'
import { useMapShell } from '../hooks/use-map-shell'
import { useMapShellActions } from '../hooks/use-map-shell-actions'
import { BaseLayer } from './base-layer'
import { LayerManagerPanel } from './layer-manager/panel'
import { Nav } from './nav'
import { Status } from './status-bar'
import { Toolbar } from './toolbar'
import { UserAvatarTrigger } from './user-avatar'

export function MapShell() {
  const containerRef = useRef<HTMLDivElement>(null)
  const runtime = useMapRuntime()
  const snapshot = useMapRuntimeSnapshot()

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

  const shell = useMapShell(snapshot)
  const { actions: shellActions, derived, state } = shell
  const { actions: mapActions } = useMapShellActions({
    runtime,
    shell
  })

  return (
    <MapAssistantProvider
      runtime={runtime}
      viewport={state.viewport}
      activeBaseLayer={state.activeBaseLayer}
      panels={state.panels}
      visibleLayerCount={derived.visibleLayerCount}
      onLocate={mapActions.locate}
      onResetView={mapActions.resetView}
      onSwitchBaseLayer={mapActions.switchBaseLayer}
      onToggleLayerList={mapActions.toggleLayerList}
      onToggleAssistantPanel={mapActions.toggleAssistantPanel}
    >
      <div className='relative h-screen w-full overflow-hidden text-neutral-900 dark:text-white'>
        <div className='absolute inset-0 flex h-full w-full overflow-hidden'>
          <div className='relative h-full min-w-0 flex-1 overflow-hidden'>
            <section className='absolute inset-0 overflow-hidden'>
              <div ref={containerRef} className='absolute inset-0 z-0' />
              <BaseLayer activeBaseLayer={state.activeBaseLayer} onChange={mapActions.switchBaseLayer} />
            </section>

            <Toolbar
              actions={derived.toolbarActions}
              layerManagerOpen={state.panels.layerManagerOpen}
              onAction={mapActions.toolbarAction}
              onToggleLayerManager={mapActions.toggleLayerManager}
            />

            <LayerManagerPanel
              open={state.panels.layerManagerOpen}
              data={{
                importStatus: state.importStatus,
                layers: derived.layers
              }}
              actions={{
                onToggle: mapActions.toggleLayerManager,
                onImportLayers: shellActions.importLayers,
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
