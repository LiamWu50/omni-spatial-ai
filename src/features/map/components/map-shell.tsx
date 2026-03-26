'use client'

import { useEffect, useRef } from 'react'

import { useMapBridge, useMapSnapshot } from '../hooks/use-map-runtime'
import { useMapShell } from '../hooks/use-map-shell'
import { useMapShellActions } from '../hooks/use-map-shell-actions'
import { AssistantEntry } from './assistant/entry'
import { AssistantPanel } from './assistant/panel'
import { MapAssistantProvider } from './assistant/provider'
import { BaseLayer } from './base-layer'
import { LayerManagerPanel } from './layer-manager/layer-manager-panel'
import { Nav } from './nav'
import { Status } from './status'
import { Toolbar } from './toolbar'

export function MapShell() {
  const containerRef = useRef<HTMLDivElement>(null)
  const bridge = useMapBridge()
  const snapshot = useMapSnapshot()

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    return bridge.mount(container)
  }, [bridge])

  const {
    activeBaseLayer,
    activeTool,
    focusUserLayer,
    panels,
    removeUserLayer,
    setActiveTool,
    setPanelState,
    statusBar,
    toolbarActions,
    toggleUserLayer,
    uploadStatus,
    uploadUserLayers,
    userLayers,
    viewport,
    visibleLayerCount
  } = useMapShell(snapshot)

  const {
    handleAssistantPanelChange,
    handleLocate,
    handleOpenAssistantPanel,
    handleResetOrientation,
    handleResetView,
    handleSwitchBaseLayer,
    handleToggle3D,
    handleToggleAssistantPanel,
    handleToggleLayerList,
    handleToggleLayerManager,
    handleToolbarAction,
    handleZoomIn,
    handleZoomOut
  } = useMapShellActions({
    bridge,
    activeTool,
    panels,
    setActiveTool,
    setPanelState,
    viewport
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
              userLayers={userLayers}
              onToggleLayerManager={handleToggleLayerManager}
              onUploadFiles={uploadUserLayers}
              onToggleUserLayer={toggleUserLayer}
              onFocusUserLayer={focusUserLayer}
              onRemoveUserLayer={removeUserLayer}
            />

            <AssistantEntry visible={!panels.assistantPanelOpen} onOpen={handleOpenAssistantPanel} />

            <Nav
              is3D={viewport.is3D}
              onLocate={handleLocate}
              onResetOrientation={handleResetOrientation}
              onToggle3D={handleToggle3D}
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
