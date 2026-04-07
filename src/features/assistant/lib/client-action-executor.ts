'use client'

import { toast } from 'sonner'

import { type MapClientAction, type MapLayerStylePatch } from '@/lib/ai/contracts'
import type { LayerDescriptor } from '@/lib/gis/schema'

import type { MapRuntime } from '../../map/services/map-runtime'

export interface MapClientActionExecutorContext {
  runtime: MapRuntime
  locateUser: () => void
}

function mergeLayerStyle(layer: LayerDescriptor, stylePatch: MapLayerStylePatch) {
  const { visible, ...style } = stylePatch

  return {
    ...layer,
    visible: visible ?? layer.visible,
    style: {
      ...layer.style,
      ...style
    }
  }
}

export async function executeMapClientAction(action: MapClientAction, context: MapClientActionExecutorContext) {
  switch (action.type) {
    case 'view.fly_to': {
      await context.runtime.moveTo({
        center: action.center,
        zoom: action.zoom
      })
      return
    }
    case 'view.fit_bounds': {
      await context.runtime.fitBounds(action.bounds)
      return
    }
    case 'view.reset': {
      await context.runtime.resetView()
      return
    }
    case 'view.locate_user': {
      context.locateUser()
      return
    }
    case 'layer.add': {
      await context.runtime.addLayer(action.layer)
      return
    }
    case 'layer.update_style': {
      const target = context.runtime.getSnapshot().layers.find((layer) => layer.id === action.layerId)

      if (!target) {
        throw new Error(`图层不存在：${action.layerId}`)
      }

      await context.runtime.updateLayer(mergeLayerStyle(target, action.style))
      return
    }
  }
}

export async function executeMapClientActions(actions: MapClientAction[], context: MapClientActionExecutorContext) {
  console.log('执行地图动作', actions)
  for (const action of actions) {
    try {
      await executeMapClientAction(action, context)
    } catch (error) {
      const message = error instanceof Error ? error.message : '地图动作执行失败'
      toast.error(message)
      throw error
    }
  }
}
