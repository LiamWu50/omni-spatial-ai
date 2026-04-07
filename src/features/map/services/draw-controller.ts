import type { FeatureGroup, Map as LeafletMap } from 'leaflet'

import type { LayerDescriptor } from '@/lib/gis/schema'

import { createDrawLayerFromFeature, isDrawLayer } from '../lib/user-layers'
import type { MapTool } from '../types'
import { PathSession } from './path-session'
import { PointDrawSession } from './point-draw-session'
import type { ManagedToolLayerCallbacks } from './tool-controllers-shared'
import { DRAW_COLOR, syncVisibleLayers } from './tool-controllers-shared'
import { buildFeatureFromPath, buildPointFeature, getPathGeometryType } from './tool-geometry'
import type { MapToolController } from './tool-registry'

type LeafletModule = typeof import('leaflet')

export class DrawToolController implements MapToolController {
  private readonly callbacks: ManagedToolLayerCallbacks

  private map: LeafletMap | null = null

  private leaflet: LeafletModule | null = null

  private featureGroup: FeatureGroup | null = null

  private currentLayers = new Map<string, LayerDescriptor>()

  private pointSession: PointDrawSession | null = null

  private pathSession: PathSession | null = null

  private pointSequence = 0

  private lineSequence = 0

  private polygonSequence = 0

  constructor(callbacks: ManagedToolLayerCallbacks) {
    this.callbacks = callbacks
  }

  attach(map: LeafletMap, leaflet: LeafletModule) {
    this.map = map
    this.leaflet = leaflet
    this.featureGroup = leaflet.featureGroup().addTo(map)
  }

  activate(tool: MapTool) {
    if (!this.map || !this.leaflet) {
      return
    }

    this.deactivate()

    if (tool === 'point') {
      this.pointSession = new PointDrawSession(this.map, (point) => {
        const nextLayer = createDrawLayerFromFeature({
          feature: buildPointFeature(point),
          sequence: ++this.pointSequence,
          uniqueToken: `${Date.now()}-${this.pointSequence}`
        })

        void this.callbacks.onAddLayer(nextLayer)
      })
      this.pointSession.start()
      return
    }

    this.pathSession = new PathSession(this.map, this.leaflet, {
      color: DRAW_COLOR,
      fillColor: DRAW_COLOR,
      fillOpacity: 0.18,
      onComplete: (points, closed) => {
        const geometryType = getPathGeometryType(points, closed)

        if (!geometryType) {
          return
        }

        const nextSequence = geometryType === 'polygon' ? ++this.polygonSequence : ++this.lineSequence
        const nextLayer = createDrawLayerFromFeature({
          feature: buildFeatureFromPath(points, geometryType),
          sequence: nextSequence,
          uniqueToken: `${Date.now()}-${nextSequence}`
        })

        void this.callbacks.onAddLayer(nextLayer)
      }
    })
    this.pathSession.start()
  }

  deactivate() {
    this.pointSession?.destroy()
    this.pathSession?.destroy()
    this.pointSession = null
    this.pathSession = null
  }

  destroy() {
    this.deactivate()
    this.currentLayers.clear()
    this.featureGroup?.clearLayers()
    this.featureGroup?.remove()
    this.featureGroup = null
    this.map = null
    this.leaflet = null
  }

  syncLayers(layers: LayerDescriptor[]) {
    this.currentLayers = new Map(layers.filter(isDrawLayer).map((layer) => [layer.id, layer]))

    syncVisibleLayers({
      group: this.featureGroup,
      layers: this.currentLayers.values(),
      leaflet: this.leaflet,
      useMarkerForPoint: true
    })
  }
}
