import type { FeatureCollection } from 'geojson'

import type { FeatureQuery, GeoJsonFeatureCollection, LayerDescriptor } from '@/lib/gis/schema'

import { shouldRenderInGenericLayerManager } from './tools/tool-controllers-shared'

type LeafletModule = typeof import('leaflet')
type LeafletMap = import('leaflet').Map
type LeafletGeoJSON = import('leaflet').GeoJSON
type LeafletLayerGroup = import('leaflet').LayerGroup

interface LayerManagerOptions {
  initialLayers?: LayerDescriptor[]
  onLayersChange: (layers: LayerDescriptor[]) => void
}

export class LayerManager {
  private readonly layers = new Map<string, LayerDescriptor>()

  private map: LeafletMap | null = null

  private leaflet: LeafletModule | null = null

  private dataLayerGroup: LeafletLayerGroup | null = null

  private renderedLayers = new Map<string, LeafletGeoJSON>()

  private highlightLayer: LeafletGeoJSON | null = null

  private readonly onLayersChange: LayerManagerOptions['onLayersChange']

  constructor(options: LayerManagerOptions) {
    this.onLayersChange = options.onLayersChange

    for (const layer of options.initialLayers ?? []) {
      this.layers.set(layer.id, layer)
    }
  }

  attach(map: LeafletMap, leaflet: LeafletModule) {
    this.map = map
    this.leaflet = leaflet
    this.dataLayerGroup = leaflet.layerGroup().addTo(map)
    this.syncRenderedLayers()
  }

  detach() {
    this.highlightLayer?.remove()
    this.highlightLayer = null
    this.renderedLayers.clear()
    this.dataLayerGroup?.clearLayers()
    this.dataLayerGroup = null
    this.map = null
    this.leaflet = null
  }

  getLayers() {
    return [...this.layers.values()]
  }

  async addLayer(layer: LayerDescriptor) {
    this.layers.set(layer.id, layer)
    this.syncRenderedLayers()
    this.onLayersChange(this.getLayers())
  }

  async updateLayer(layer: LayerDescriptor) {
    if (!this.layers.has(layer.id)) {
      throw new Error(`图层不存在: ${layer.id}`)
    }

    this.layers.set(layer.id, layer)
    this.syncRenderedLayers()
    this.onLayersChange(this.getLayers())
  }

  async removeLayer(layerId: string) {
    this.layers.delete(layerId)
    this.renderedLayers.get(layerId)?.remove()
    this.renderedLayers.delete(layerId)
    this.syncRenderedLayers()
    this.onLayersChange(this.getLayers())
  }

  async highlightFeature(query: FeatureQuery) {
    const layer = this.layers.get(query.layerId)

    if (!layer || layer.sourceType !== 'geojson' || !layer.data) {
      return
    }

    const features = this.filterGeoJsonFeatures(layer.data as GeoJsonFeatureCollection, query)
    this.renderHighlight(features)
  }

  private syncRenderedLayers() {
    if (!this.leaflet || !this.dataLayerGroup) {
      return
    }

    const leaflet = this.leaflet
    const activeLayerIds = new Set<string>()

    for (const layer of this.layers.values()) {
      activeLayerIds.add(layer.id)

      if (
        !shouldRenderInGenericLayerManager(layer) ||
        !layer.visible ||
        layer.sourceType !== 'geojson' ||
        !layer.data
      ) {
        this.renderedLayers.get(layer.id)?.remove()
        this.renderedLayers.delete(layer.id)
        continue
      }

      this.renderedLayers.get(layer.id)?.remove()

      const geoJsonLayer = leaflet.geoJSON(layer.data as GeoJsonFeatureCollection, {
        pointToLayer: (_feature, latlng) =>
          leaflet.circleMarker(latlng, {
            color: layer.style.color ?? '#60a5fa',
            fillColor: layer.style.fillColor ?? layer.style.color ?? '#60a5fa',
            fillOpacity: layer.style.fillOpacity ?? layer.style.opacity ?? 0.75,
            opacity: layer.style.opacity ?? 0.95,
            radius: layer.style.radius ?? 6,
            weight: Math.max(1, layer.style.lineWidth ?? 2)
          }),
        style: () => ({
          color: layer.style.color ?? '#60a5fa',
          fillColor: layer.style.fillColor ?? layer.style.color ?? '#60a5fa',
          fillOpacity: layer.style.fillOpacity ?? layer.style.opacity ?? 0.28,
          opacity: layer.style.opacity ?? 0.95,
          weight: Math.max(1, layer.style.lineWidth ?? 2)
        })
      })

      geoJsonLayer.addTo(this.dataLayerGroup)
      this.renderedLayers.set(layer.id, geoJsonLayer)
    }

    for (const [layerId, leafletLayer] of this.renderedLayers.entries()) {
      if (activeLayerIds.has(layerId)) {
        continue
      }

      leafletLayer.remove()
      this.renderedLayers.delete(layerId)
    }
  }

  private renderHighlight(features: GeoJsonFeatureCollection['features']) {
    if (!this.leaflet || !this.map) {
      return
    }

    const leaflet = this.leaflet
    this.highlightLayer?.remove()
    this.highlightLayer = null

    if (!features.length) {
      return
    }

    this.highlightLayer = leaflet
      .geoJSON(
        {
          type: 'FeatureCollection',
          features
        } as FeatureCollection,
        {
          pointToLayer: (_feature, latlng) =>
            leaflet.circleMarker(latlng, {
              color: '#f8fafc',
              fillColor: '#facc15',
              fillOpacity: 0.92,
              opacity: 1,
              radius: 8,
              weight: 2
            }),
          style: () => ({
            color: '#facc15',
            fillColor: '#facc15',
            fillOpacity: 0.18,
            opacity: 1,
            weight: 3
          })
        }
      )
      .addTo(this.map)
  }

  private filterGeoJsonFeatures(collection: GeoJsonFeatureCollection, query: FeatureQuery) {
    const matches = collection.features.filter((feature) => {
      if (!query.property) {
        return true
      }

      return feature.properties?.[query.property] === query.value
    })

    return query.limit ? matches.slice(0, query.limit) : matches
  }
}
