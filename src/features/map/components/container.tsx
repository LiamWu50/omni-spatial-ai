'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'

import { useMapAssistantRuntime } from '../hooks/use-map-assistant-runtime'
import { useMapBridge, useMapSnapshot } from '../hooks/use-map-runtime'
import { useMapShell } from '../hooks/use-map-shell'
import { useMapShellActions } from '../hooks/use-map-shell-actions'
import { AssistantEntry } from './assistant/entry'
import { AssistantPanel } from './assistant/panel'
import { BaseLayer } from './base-layer'
import { Host } from './host'
import { LayerManagerPanel } from './layer-manager/layer-manager-panel'
import { Nav } from './nav'
import { Scene } from './scene'
import { Status } from './status'
import { Toolbar } from './toolbar'

export function Container() {
  const bridge = useMapBridge()
  const snapshot = useMapSnapshot()
  const {
    activeBaseLayer,
    activeTool,
    layers,
    panels,
    quickLocations,
    setActiveTool,
    setPanelState,
    statusBar,
    toggleLayer,
    toolbarActions,
    viewport,
    visibleLayerCount
  } = useMapShell(snapshot)

  const {
    handleAssistantPanelChange,
    handleLocate,
    handleOpenAssistantPanel,
    handleOpenQuickLocation,
    handleResetOrientation,
    handleResetView,
    handleSwitchBaseLayer,
    handleToggle3D,
    handleToggleAssistantPanel,
    handleToggleLayerList,
    handleToggleLayerManager,
    handleToggleSearch,
    handleToolbarAction,
    handleZoomIn,
    handleZoomOut
  } = useMapShellActions({
    bridge,
    activeTool,
    panels,
    quickLocations,
    setActiveTool,
    setPanelState,
    viewport
  })

  const runtime = useMapAssistantRuntime({
    viewport,
    activeBaseLayer,
    panels,
    visibleLayerCount,
    onLocate: handleLocate,
    onResetView: handleResetView,
    onSwitchBaseLayer: handleSwitchBaseLayer,
    onToggleLayerList: handleToggleLayerList,
    onToggleAssistantPanel: handleToggleAssistantPanel
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='earth-shell relative h-screen w-full overflow-hidden text-white'>
        <div className='absolute inset-0 flex h-full w-full overflow-hidden'>
          <div className='relative h-full min-w-0 flex-1 overflow-hidden'>
            <section className='absolute inset-0 overflow-hidden'>
              <Host />
              <Scene activeBaseLayer={activeBaseLayer} />
              <BaseLayer activeBaseLayer={activeBaseLayer} onChange={handleSwitchBaseLayer} />
            </section>

            <Toolbar actions={toolbarActions} onAction={handleToolbarAction} />

            <LayerManagerPanel
              layers={layers}
              layerManagerOpen={panels.layerManagerOpen}
              layerListOpen={panels.layerListOpen}
              searchOpen={panels.searchOpen}
              visibleLayerCount={visibleLayerCount}
              quickLocations={quickLocations}
              onToggleLayerManager={handleToggleLayerManager}
              onToggleLayerList={handleToggleLayerList}
              onToggleSearch={handleToggleSearch}
              onToggleLayer={toggleLayer}
              onOpenQuickLocation={handleOpenQuickLocation}
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
    </AssistantRuntimeProvider>
  )
}
