'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { PanelRightClose } from 'lucide-react'
import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useState } from 'react'

import { useMapAssistantRuntime } from '../bridge/assistant'
import { useMapBridge, useMapSnapshot } from '../bridge/map'
import { useMapShellModel } from '../model/use-shell'
import { Assistant } from '../ui/assistant'
import { BaseMap } from '../ui/basemap'
import { Drawer } from '../ui/drawer'
import { Nav } from '../ui/nav'
import { Prompt } from '../ui/prompt'
import { Status } from '../ui/status'
import { Toolbar } from '../ui/toolbar'
import { MapHost } from './host'
import { Scene } from './scene'

const DEFAULT_ASSISTANT_RATIO = 0.34
const DEFAULT_ASSISTANT_WIDTH = 420
const MIN_ASSISTANT_WIDTH = 320

function getAssistantMaxWidth(viewportWidth: number) {
  return Math.max(MIN_ASSISTANT_WIDTH, Math.round(viewportWidth * 0.4))
}

function clampAssistantWidth(nextWidth: number, viewportWidth: number) {
  const maxWidth = getAssistantMaxWidth(viewportWidth)
  return Math.min(Math.max(nextWidth, MIN_ASSISTANT_WIDTH), maxWidth)
}

export function MapShell() {
  const bridge = useMapBridge()
  const snapshot = useMapSnapshot()
  const [assistantWidth, setAssistantWidth] = useState(DEFAULT_ASSISTANT_WIDTH)
  const [isResizingAssistant, setIsResizingAssistant] = useState(false)
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
  } = useMapShellModel(snapshot)

  const handleLocate = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      void bridge.locate({
        lng: Number(position.coords.longitude.toFixed(5)),
        lat: Number(position.coords.latitude.toFixed(5))
      })
    })
  }

  const handleResetView = () => {
    void bridge.resetView()
  }

  const handleOpenQuickLocation = (locationId: string) => {
    const target = quickLocations.find((location) => location.id === locationId)

    if (!target) {
      return
    }

    void bridge.moveTo({
      center: target.center,
      zoom: target.zoom,
      pitch: 48,
      bearing: 12,
      altitude: Math.max(1800, 26000 - target.zoom * 2000)
    })
  }

  const handleToggle3D = () => {
    const nextEngine = viewport.is3D ? 'mapbox' : 'cesium'
    void bridge.switchEngine(nextEngine)
  }

  const handleToolbarAction = (actionId: string) => {
    switch (actionId) {
      case 'measure':
        setActiveTool(activeTool === 'measure' ? null : 'measure')
        return
      case 'draw':
        setActiveTool(activeTool === 'draw' ? null : 'draw')
        return
      default:
        return
    }
  }

  const runtime = useMapAssistantRuntime({
    viewport,
    activeBaseLayer,
    panels,
    visibleLayerCount,
    onLocate: handleLocate,
    onResetView: handleResetView,
    onSwitchBaseLayer: (layer) => {
      void bridge.switchBaseLayer(layer)
    },
    onToggleLayerPanel: () => {
      setPanelState({
        leftDrawerOpen: true,
        layerPanelOpen: !panels.layerPanelOpen
      })
    },
    onToggleAiPanel: (open) => {
      setPanelState({ aiPanelOpen: open ?? !panels.aiPanelOpen })
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncWidth = () => {
      setAssistantWidth((current) => {
        const preferred = Math.round(window.innerWidth * DEFAULT_ASSISTANT_RATIO)
        const fallback = current === DEFAULT_ASSISTANT_WIDTH ? preferred : current
        return clampAssistantWidth(fallback, window.innerWidth)
      })
    }

    syncWidth()
    window.addEventListener('resize', syncWidth)
    return () => window.removeEventListener('resize', syncWidth)
  }, [])

  useEffect(() => {
    if (!isResizingAssistant) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      setAssistantWidth(clampAssistantWidth(window.innerWidth - event.clientX, window.innerWidth))
    }

    const handlePointerUp = () => {
      setIsResizingAssistant(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isResizingAssistant])

  const handleAssistantResizeStart = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsResizingAssistant(true)
  }, [])

  const assistantPanelStyle = useMemo(
    () => ({
      width: panels.aiPanelOpen ? `${assistantWidth}px` : '0px'
    }),
    [assistantWidth, panels.aiPanelOpen]
  )

  const mapStage = (
    <div className='relative h-full min-w-0 flex-1 overflow-hidden'>
      <section className='absolute inset-0 overflow-hidden'>
        <MapHost />
        <Scene activeBaseLayer={activeBaseLayer} />
        <BaseMap activeBaseLayer={activeBaseLayer} onChange={(layer) => void bridge.switchBaseLayer(layer)} />
      </section>

      <Toolbar actions={toolbarActions} onAction={handleToolbarAction} />

      <Drawer
        layers={layers}
        leftDrawerOpen={panels.leftDrawerOpen}
        layerPanelOpen={panels.layerPanelOpen}
        searchOpen={panels.searchOpen}
        visibleLayerCount={visibleLayerCount}
        quickLocations={quickLocations}
        onToggleDrawer={() => setPanelState({ leftDrawerOpen: !panels.leftDrawerOpen })}
        onToggleLayerPanel={() => setPanelState({ layerPanelOpen: !panels.layerPanelOpen })}
        onToggleSearch={() => setPanelState({ searchOpen: !panels.searchOpen, leftDrawerOpen: true })}
        onToggleLayer={toggleLayer}
        onOpenQuickLocation={handleOpenQuickLocation}
      />

      {!panels.aiPanelOpen ? <Prompt variant='overlay' /> : null}

      {!panels.aiPanelOpen ? <AssistantEdgeTrigger onOpen={() => setPanelState({ aiPanelOpen: true })} /> : null}

      <Nav
        is3D={viewport.is3D}
        onLocate={handleLocate}
        onResetOrientation={() => void bridge.resetOrientation()}
        onToggle3D={handleToggle3D}
        onZoomIn={() => void bridge.zoomIn()}
        onZoomOut={() => void bridge.zoomOut()}
      />

      <Status state={statusBar} />
    </div>
  )

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className='earth-shell relative h-screen w-full overflow-hidden text-white'>
        <div className='absolute inset-0 flex h-full w-full overflow-hidden'>
          {mapStage}

          <div
            className={`relative shrink-0 overflow-hidden border-l border-white/0 transition-[width,border-color] duration-300 ease-out ${
              panels.aiPanelOpen ? 'border-white/8' : ''
            } ${isResizingAssistant ? 'transition-none' : ''}`}
            style={assistantPanelStyle}
          >
            <div
              className={`absolute inset-y-0 left-0 z-30 w-5 -translate-x-1/2 cursor-col-resize ${
                panels.aiPanelOpen ? 'block' : 'hidden'
              }`}
              onPointerDown={handleAssistantResizeStart}
              role='separator'
              aria-label='调整对话详情宽度'
              aria-orientation='vertical'
            >
              <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/12 transition-colors hover:bg-white/28' />
            </div>

            {panels.aiPanelOpen ? (
              <button
                type='button'
                onClick={() => setPanelState({ aiPanelOpen: false })}
                className='absolute top-1/2 left-0 z-40 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/88 text-white/78 shadow-[0_12px_36px_rgba(0,0,0,0.42)] transition hover:border-white/18 hover:bg-black hover:text-white'
                aria-label='收起对话详情'
              >
                <PanelRightClose className='h-4 w-4' />
              </button>
            ) : null}

            <div className='h-full min-w-[320px]'>
              <Assistant open={panels.aiPanelOpen} footer={<Prompt variant='docked' />} />
            </div>
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}

function AssistantEdgeTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type='button'
      onClick={onOpen}
      className='group absolute top-0 right-0 z-20 h-full w-10 cursor-pointer bg-transparent'
      aria-label='打开对话详情'
    >
      <span className='absolute inset-y-0 left-3 w-px bg-white/0 transition-colors duration-300 group-hover:bg-white/14' />
      <span className='absolute inset-y-0 inset-x-0 bg-white/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
    </button>
  )
}
