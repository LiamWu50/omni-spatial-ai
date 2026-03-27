'use client'

import { useEffect, useRef } from 'react'

import { AssistantEntry } from '../assistant/components/entry'
import { AssistantPanel } from '../assistant/components/panel'
import { MapAssistantProvider } from '../assistant/runtime/provider'
import { useMapRuntime, useMapRuntimeSnapshot } from '../hooks/use-map-runtime'
import { useMapShell } from '../hooks/use-map-shell'
import { useMapShellActions } from '../hooks/use-map-shell-actions'
import { BaseLayer } from './base-layer'
import { LayerManagerPanel } from './layer-manager/layer-manager-panel'
import { Nav } from './nav'
import { Status } from './status'
import { Toolbar } from './toolbar'

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

  const {
    activeBaseLayer,
    activeTool,
    focusManagedLayer,
    managedLayers,
    panels,
    removeManagedLayer,
    setPanelState,
    statusBar,
    toolbarActions,
    toggleManagedLayer,
    uploadStatus,
    uploadUserLayers,
    viewport,
    visibleLayerCount
  } = useMapShell(snapshot)

  const {
    handleAssistantPanelChange,
    handleLocate,
    handleOpenAssistantPanel,
    handleResetView,
    handleSwitchBaseLayer,
    handleToggleAssistantPanel,
    handleToggleLayerList,
    handleToggleLayerManager,
    handleToolbarAction,
    handleZoomIn,
    handleZoomOut
  } = useMapShellActions({
    runtime,
    activeTool,
    panels,
    setPanelState
  })

  return (
    <MapAssistantProvider
      viewport={viewport}
      activeBaseLayer={activeBaseLayer}
      panels={panels}
      visibleLayerCount={visibleLayerCount}
      onLocate={handleLocate}
      onResetView={handleResetView}
      onSwitchBaseLayer={handleSwitchBaseLayer}
      onToggleLayerList={handleToggleLayerList}
      onToggleAssistantPanel={handleToggleAssistantPanel}
    >
      <div className='relative h-screen w-full overflow-hidden text-neutral-900 dark:text-white'>
        <div className='absolute inset-0 flex h-full w-full overflow-hidden'>
          <div className='relative h-full min-w-0 flex-1 overflow-hidden'>
            <section className='absolute inset-0 overflow-hidden'>
              <div ref={containerRef} className='absolute inset-0 z-0' />
              <BaseLayer activeBaseLayer={activeBaseLayer} onChange={handleSwitchBaseLayer} />
            </section>

            <Toolbar
              actions={toolbarActions}
              layerManagerOpen={panels.layerManagerOpen}
              onAction={handleToolbarAction}
              onToggleLayerManager={handleToggleLayerManager}
            />

            <LayerManagerPanel
              layerManagerOpen={panels.layerManagerOpen}
              uploadStatus={uploadStatus}
              managedLayers={managedLayers}
              onToggleLayerManager={handleToggleLayerManager}
              onUploadFiles={uploadUserLayers}
              onToggleManagedLayer={toggleManagedLayer}
              onFocusManagedLayer={focusManagedLayer}
              onRemoveManagedLayer={removeManagedLayer}
            />

            <AssistantEntry visible={!panels.assistantPanelOpen} onOpen={handleOpenAssistantPanel} />

            <Nav
              onLocate={handleLocate}
              onResetView={handleResetView}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />

            <Status state={statusBar} />
          </div>

          <AssistantPanel open={panels.assistantPanelOpen} onOpenChange={handleAssistantPanelChange} />
        </div>
      </div>
    </MapAssistantProvider>
  )
}
