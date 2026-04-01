'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { LayerDescriptor } from '@/lib/gis/schema'

import { INITIAL_PANEL_STATE, LAYER_UPLOAD_MAX_SIZE_MB, TOOLBAR_ACTIONS } from '../lib/constants'
import { formatAttribution, formatCoordinate, formatScale } from '../lib/formatters'
import { isManagedLayer, parseUserLayerFile, toUserLayerListItem } from '../lib/user-layers'
import { mapRuntime, type MapRuntimeState } from '../services/map-runtime'
import type { MapTool, ShellPanelState, ShellToolbarAction, StatusBarState } from '../types'

export interface UseMapShellState {
  activeBaseLayer: ReturnType<typeof mapRuntime.getBaseLayerType>
  activeTool: MapTool | null
  importStatus: string
  panels: ShellPanelState
  viewport: ReturnType<typeof mapRuntime.toViewportState>
}

export interface UseMapShellDerived {
  layers: ReturnType<typeof toUserLayerListItem>[]
  statusBar: StatusBarState
  toolbarActions: ShellToolbarAction[]
  visibleLayerCount: number
}

export interface UseMapShellActions {
  setPanelState: (updater: Partial<ShellPanelState>) => void
  importLayers: (files: File[]) => Promise<void>
  toggleLayer: (layerId: string) => Promise<void>
  focusLayer: (layerId: string) => Promise<void>
  removeLayer: (layerId: string) => Promise<void>
}

export interface UseMapShellResult {
  state: UseMapShellState
  derived: UseMapShellDerived
  actions: UseMapShellActions
}

export function useMapShell(snapshot: MapRuntimeState): UseMapShellResult {
  const [panels, setPanels] = useState<ShellPanelState>(INITIAL_PANEL_STATE)
  const [importStatus, setImportStatus] = useState(`点击或拖拽上传，最多 ${LAYER_UPLOAD_MAX_SIZE_MB} MB`)

  const activeBaseLayer = mapRuntime.getBaseLayerType(snapshot.baseMap)
  const viewport = mapRuntime.toViewportState(snapshot)
  const activeTool = snapshot.activeTool as MapTool | null

  const layers = useMemo(() => snapshot.layers.filter(isManagedLayer).map(toUserLayerListItem), [snapshot.layers])

  const visibleLayerCount = useMemo(() => layers.filter((layer) => layer.visible).length, [layers])

  const statusBar = useMemo<StatusBarState>(
    () => ({
      attribution: formatAttribution(activeBaseLayer),
      scaleLabel: formatScale(viewport.zoom),
      coordinateLabel: formatCoordinate(viewport.center.lng, viewport.center.lat),
      zoomLabel: `Z${viewport.zoom.toFixed(1)}`
    }),
    [activeBaseLayer, viewport]
  )

  const toolbarActions = useMemo<ShellToolbarAction[]>(
    () =>
      TOOLBAR_ACTIONS.map((action) => ({
        ...action,
        active: activeTool === action.id
      })),
    [activeTool]
  )

  const actions: UseMapShellActions = {
    setPanelState(updater: Partial<ShellPanelState>) {
      setPanels((current) => ({ ...current, ...updater }))
    },
    async importLayers(files: File[]) {
      if (files.length === 0) {
        return
      }

      const requestId = Date.now()
      const importedLayers: LayerDescriptor[] = []
      const failedFiles: string[] = []

      setImportStatus(`正在导入 ${files.length} 个文件...`)

      for (const [index, file] of files.entries()) {
        try {
          const layer = await parseUserLayerFile(file, `${requestId}-${index}`)
          await mapRuntime.addLayer(layer)
          importedLayers.push(layer)
        } catch (error) {
          const message = error instanceof Error ? error.message : '导入失败'
          failedFiles.push(`${file.name}：${message}`)
        }
      }

      if (importedLayers.length === 0) {
        const message = failedFiles[0] ?? '未导入任何图层'
        setImportStatus(message)
        toast.error(message)
        return
      }

      const latestLayer = importedLayers[importedLayers.length - 1]
      const latestLayerItem = toUserLayerListItem(latestLayer)

      if (latestLayerItem.bounds) {
        await mapRuntime.fitBounds(latestLayerItem.bounds)
      }

      const successMessage =
        importedLayers.length === 1
          ? `已导入 ${latestLayer.name}，共 ${latestLayerItem.featureCount} 个要素`
          : `已导入 ${importedLayers.length} 个图层`

      const statusMessage =
        failedFiles.length > 0 ? `${successMessage}，${failedFiles.length} 个文件失败` : successMessage

      setImportStatus(statusMessage)
      toast.success(successMessage)

      if (failedFiles.length > 0) {
        toast.error(`部分文件导入失败：${failedFiles[0]}`)
      }
    },
    async toggleLayer(layerId: string) {
      const target = snapshot.layers.find((layer) => layer.id === layerId)

      if (!target) {
        return
      }

      await mapRuntime.updateLayer({
        ...target,
        visible: !target.visible
      })
    },
    async focusLayer(layerId: string) {
      const target = snapshot.layers.find((layer) => layer.id === layerId)

      if (!target) {
        return
      }

      const layerItem = toUserLayerListItem(target)

      if (!layerItem.bounds) {
        toast.info('当前图层缺少可定位范围')
        return
      }

      await mapRuntime.fitBounds(layerItem.bounds)
    },
    async removeLayer(layerId: string) {
      const target = snapshot.layers.find((layer) => layer.id === layerId)

      if (!target) {
        return
      }

      await mapRuntime.removeLayer(layerId)
      toast.success(`已删除图层：${target.name}`)
    }
  }

  return {
    state: {
      activeBaseLayer,
      activeTool,
      importStatus,
      panels,
      viewport
    },
    derived: {
      layers,
      statusBar,
      toolbarActions,
      visibleLayerCount
    },
    actions
  }
}
