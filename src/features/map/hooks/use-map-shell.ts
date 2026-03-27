'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { LayerDescriptor } from '@/lib/gis/schema'
import { INITIAL_PANEL_STATE, TOOLBAR_ACTIONS } from '../lib/constants'
import { formatAttribution, formatCoordinate, formatScale } from '../lib/formatters'
import { isManagedLayer, parseUserLayerFile, toUserLayerListItem } from '../lib/user-layers'
import { type MapRuntimeState, mapRuntime } from '../services/map-runtime'
import type { MapTool, ShellPanelState, ShellToolbarAction, StatusBarState } from '../types'

export function useMapShell(snapshot: MapRuntimeState) {
  const [panels, setPanels] = useState<ShellPanelState>(INITIAL_PANEL_STATE)
  const [uploadStatus, setUploadStatus] = useState('支持拖拽或点击上传 GeoJSON / JSON 文件')

  const activeBaseLayer = mapRuntime.getBaseLayerType(snapshot.baseMap)
  const viewport = mapRuntime.toViewportState(snapshot)
  const activeTool = snapshot.activeTool as MapTool | null

  const managedLayers = useMemo(
    () => snapshot.layers.filter(isManagedLayer).map(toUserLayerListItem),
    [snapshot.layers]
  )

  const visibleLayerCount = useMemo(() => managedLayers.filter((layer) => layer.visible).length, [managedLayers])

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

  return {
    activeBaseLayer,
    activeTool,
    panels,
    setPanelState(updater: Partial<ShellPanelState>) {
      setPanels((current) => ({ ...current, ...updater }))
    },
    statusBar,
    uploadStatus,
    async uploadUserLayers(files: File[]) {
      if (files.length === 0) {
        return
      }

      const requestId = Date.now()
      const importedLayers: LayerDescriptor[] = []
      const failedFiles: string[] = []

      setUploadStatus(`正在导入 ${files.length} 个文件...`)

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
        setUploadStatus(message)
        toast.error(message)
        return
      }

      const latestLayer = importedLayers[importedLayers.length - 1]
      const latestManagedLayer = toUserLayerListItem(latestLayer)

      if (latestManagedLayer.bounds) {
        await mapRuntime.fitBounds(latestManagedLayer.bounds)
      }

      const successMessage =
        importedLayers.length === 1
          ? `已导入 ${latestLayer.name}，共 ${latestManagedLayer.featureCount} 个要素`
          : `已导入 ${importedLayers.length} 个图层`

      const statusMessage =
        failedFiles.length > 0 ? `${successMessage}，${failedFiles.length} 个文件失败` : successMessage

      setUploadStatus(statusMessage)
      toast.success(successMessage)

      if (failedFiles.length > 0) {
        toast.error(`部分文件导入失败：${failedFiles[0]}`)
      }
    },
    async toggleManagedLayer(layerId: string) {
      const target = snapshot.layers.find((layer) => layer.id === layerId)

      if (!target) {
        return
      }

      await mapRuntime.updateLayer({
        ...target,
        visible: !target.visible
      })
    },
    async focusManagedLayer(layerId: string) {
      const target = snapshot.layers.find((layer) => layer.id === layerId)

      if (!target) {
        return
      }

      const managedLayer = toUserLayerListItem(target)

      if (!managedLayer.bounds) {
        toast.info('当前图层缺少可定位范围')
        return
      }

      await mapRuntime.fitBounds(managedLayer.bounds)
    },
    async removeManagedLayer(layerId: string) {
      const target = snapshot.layers.find((layer) => layer.id === layerId)

      if (!target) {
        return
      }

      await mapRuntime.removeLayer(layerId)
      toast.success(`已删除图层：${target.name}`)
    },
    toolbarActions,
    managedLayers,
    viewport,
    visibleLayerCount
  }
}
