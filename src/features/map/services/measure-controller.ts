import type { FeatureGroup, Map as LeafletMap } from 'leaflet'

import type { LayerDescriptor } from '@/lib/gis/schema'

import { createMeasureLayerFromResult, isMeasureLayer } from '../lib/user-layers'
import { PathSession } from './path-session'
import type { ManagedToolLayerCallbacks } from './tool-controllers-shared'
import { MEASURE_COLOR, syncVisibleLayers } from './tool-controllers-shared'
import { buildMeasureMetrics } from './tool-geometry'
import type { MapToolController } from './tool-registry'

type LeafletModule = typeof import('leaflet')

export class MeasureToolController implements MapToolController {
  private readonly callbacks: ManagedToolLayerCallbacks

  private map: LeafletMap | null = null

  private leaflet: LeafletModule | null = null

  private resultGroup: FeatureGroup | null = null

  private currentLayers = new Map<string, LayerDescriptor>()

  private pathSession: PathSession | null = null

  private distanceSequence = 0

  private areaSequence = 0

  constructor(callbacks: ManagedToolLayerCallbacks) {
    this.callbacks = callbacks
  }

  attach(map: LeafletMap, leaflet: LeafletModule) {
    this.map = map
    this.leaflet = leaflet
    this.resultGroup = leaflet.featureGroup().addTo(map)
  }

  activate() {
    if (!this.map || !this.leaflet) {
      return
    }

    this.deactivate()
    this.pathSession = new PathSession(this.map, this.leaflet, {
      color: MEASURE_COLOR,
      fillColor: MEASURE_COLOR,
      fillOpacity: 0.14,
      singleShot: true,
      onComplete: (points, closed) => {
        const metrics = buildMeasureMetrics(points, closed)

        if (!metrics) {
          return
        }

        const isAreaMeasurement = metrics.area > 0
        const nextSequence = isAreaMeasurement ? ++this.areaSequence : ++this.distanceSequence
        const nextLayer = createMeasureLayerFromResult({
          result: metrics,
          sequence: nextSequence,
          uniqueToken: `${Date.now()}-${nextSequence}`
        })

        if (!nextLayer) {
          return
        }

        void Promise.resolve(this.callbacks.onAddLayer(nextLayer)).finally(() => {
          this.callbacks.onRequestToolChange?.(null)
        })
      }
    })
    this.pathSession.start()
  }

  deactivate() {
    this.pathSession?.destroy()
    this.pathSession = null
  }

  destroy() {
    this.deactivate()
    this.resultGroup?.clearLayers()
    this.resultGroup?.remove()
    this.resultGroup = null
    this.currentLayers.clear()
    this.map = null
    this.leaflet = null
  }

  syncLayers(layers: LayerDescriptor[]) {
    this.currentLayers = new Map(layers.filter(isMeasureLayer).map((layer) => [layer.id, layer]))

    syncVisibleLayers({
      group: this.resultGroup,
      includeMeasureLabel: true,
      layers: this.currentLayers.values(),
      leaflet: this.leaflet
    })
  }
}
