import type { FeatureCollection } from 'geojson'
import type {
  BaseMapDescriptor,
  FeatureQuery,
  GeoJsonFeatureCollection,
  LayerDescriptor,
  MapViewState
} from '@/lib/gis/schema'
import { MapEngineError } from '@/lib/map/errors'

import { BaseDomMapEngine } from './base'

type LeafletModule = typeof import('leaflet')
type LeafletMap = import('leaflet').Map
type LeafletGeoJSON = import('leaflet').GeoJSON
type LeafletLayerGroup = import('leaflet').LayerGroup
type LeafletTileLayer = import('leaflet').TileLayer
type LatLngTuple = [number, number]

type TileLayerConfig = {
  attribution: string
  maxZoom?: number
  subdomains?: string | string[]
  url: string
}

export class LeafletAdapter extends BaseDomMapEngine {
  private leaflet: LeafletModule | null = null

  private map: LeafletMap | null = null

  private dataLayerGroup: LeafletLayerGroup | null = null

  private activeBaseLayer: LeafletTileLayer | null = null

  private renderedLayers = new Map<string, LeafletGeoJSON>()

  private highlightLayer: LeafletGeoJSON | null = null

  private detachMapEvents: (() => void) | null = null

  constructor() {
    super('leaflet')
  }

  async mount(container: HTMLElement, options?: { initialView?: Partial<MapViewState>; baseMap?: BaseMapDescriptor }) {
    this.container = container
    this.view = this.normalizeView({
      ...this.view,
      ...options?.initialView
    })
    this.baseMap = options?.baseMap ?? null

    const L = await this.loadLeaflet()
    container.innerHTML = ''
    container.classList.add('leaflet-host')

    this.map = L.map(container, {
      attributionControl: false,
      preferCanvas: true,
      worldCopyJump: true,
      zoomControl: false
    })

    this.dataLayerGroup = L.layerGroup().addTo(this.map)

    L.control
      .attribution({
        position: 'bottomleft',
        prefix: false
      })
      .addTo(this.map)

    this.bindMapEvents()
    this.syncBaseLayer()
    this.syncRenderedLayers()
    this.applyViewToMap(false)
  }

  async unmount(): Promise<void> {
    this.detachMapEvents?.()
    this.detachMapEvents = null

    this.highlightLayer?.remove()
    this.highlightLayer = null

    this.renderedLayers.clear()
    this.dataLayerGroup?.clearLayers()
    this.dataLayerGroup = null

    this.activeBaseLayer?.remove()
    this.activeBaseLayer = null

    this.map?.remove()
    this.map = null

    if (this.container) {
      this.container.innerHTML = ''
      this.container.classList.remove('leaflet-host')
    }

    this.container = null
  }

  async setView(state: Partial<MapViewState>): Promise<void> {
    this.view = this.normalizeView({
      ...this.view,
      ...state
    })
    this.applyViewToMap()
  }

  async addLayer(layer: LayerDescriptor): Promise<void> {
    this.layers.set(layer.id, layer)
    this.syncRenderedLayers()
    this.emit('layerChange', { layers: [...this.layers.values()] })
  }

  async updateLayer(layer: LayerDescriptor): Promise<void> {
    if (!this.layers.has(layer.id)) {
      throw new MapEngineError(`图层不存在: ${layer.id}`, 'LAYER_NOT_FOUND')
    }

    this.layers.set(layer.id, layer)
    this.syncRenderedLayers()
    this.emit('layerChange', { layers: [...this.layers.values()] })
  }

  async removeLayer(layerId: string): Promise<void> {
    this.layers.delete(layerId)
    this.renderedLayers.get(layerId)?.remove()
    this.renderedLayers.delete(layerId)
    this.syncRenderedLayers()
    this.emit('layerChange', { layers: [...this.layers.values()] })
  }

  async setBaseMap(baseMap: BaseMapDescriptor): Promise<void> {
    this.baseMap = baseMap
    this.syncBaseLayer()
  }

  async highlightFeature(query: FeatureQuery): Promise<void> {
    const layer = this.layers.get(query.layerId)

    if (!layer || layer.sourceType !== 'geojson' || !layer.data) {
      return
    }

    const features = this.filterGeoJsonFeatures(layer.data as GeoJsonFeatureCollection, query)
    this.renderHighlight(features)
  }

  async fitBounds(bounds: [number, number, number, number]): Promise<void> {
    const L = await this.loadLeaflet()
    const map = this.map

    if (!map) {
      return
    }

    map.fitBounds(L.latLngBounds([bounds[1], bounds[0]], [bounds[3], bounds[2]]), {
      animate: true,
      padding: [32, 32]
    })
  }

  protected getBackground(): string {
    return 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)'
  }

  protected getTitle(): string {
    return 'Leaflet Lightweight'
  }

  private async loadLeaflet(): Promise<LeafletModule> {
    if (this.leaflet) {
      return this.leaflet
    }

    this.leaflet = await import('leaflet')
    return this.leaflet
  }

  private bindMapEvents() {
    const map = this.map

    if (!map) {
      return
    }

    const handleMoveEnd = () => {
      const center = map.getCenter()
      this.view = this.normalizeView({
        ...this.view,
        center: {
          lng: center.lng,
          lat: center.lat
        },
        zoom: map.getZoom()
      })
      this.emit('viewChange', this.view)
    }

    const handleClick = (event: import('leaflet').LeafletMouseEvent) => {
      this.emit('click', {
        lng: event.latlng.lng,
        lat: event.latlng.lat
      })
    }

    map.on('moveend zoomend', handleMoveEnd)
    map.on('click', handleClick)

    this.detachMapEvents = () => {
      map.off('moveend zoomend', handleMoveEnd)
      map.off('click', handleClick)
    }
  }

  private applyViewToMap(animate = true) {
    const map = this.map

    if (!map) {
      return
    }

    const center = this.toLeafletCenter(this.view)

    map.setView(center, this.view.zoom, {
      animate
    })
  }

  private syncBaseLayer() {
    const map = this.map

    if (!map) {
      return
    }

    const L = this.leaflet

    if (!L) {
      return
    }

    this.activeBaseLayer?.remove()

    const tileConfig = this.resolveTileLayer(this.baseMap)
    this.activeBaseLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom ?? 20,
      subdomains: tileConfig.subdomains ?? 'abcd'
    })

    this.activeBaseLayer.addTo(map)
  }

  private syncRenderedLayers() {
    const L = this.leaflet
    const layerGroup = this.dataLayerGroup

    if (!L || !layerGroup) {
      return
    }

    const activeLayerIds = new Set<string>()

    for (const layer of this.layers.values()) {
      activeLayerIds.add(layer.id)

      if (!layer.visible || layer.sourceType !== 'geojson' || !layer.data) {
        this.renderedLayers.get(layer.id)?.remove()
        this.renderedLayers.delete(layer.id)
        continue
      }

      this.renderedLayers.get(layer.id)?.remove()

      const geoJsonLayer = L.geoJSON(layer.data as GeoJsonFeatureCollection, {
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {
            color: layer.style.color ?? '#60a5fa',
            fillColor: layer.style.color ?? '#60a5fa',
            fillOpacity: layer.style.opacity ?? 0.75,
            opacity: layer.style.opacity ?? 0.95,
            radius: layer.style.radius ?? 6,
            weight: Math.max(1, layer.style.lineWidth ?? 2)
          }),
        style: () => ({
          color: layer.style.color ?? '#60a5fa',
          fillColor: layer.style.color ?? '#60a5fa',
          fillOpacity: layer.style.opacity ?? 0.28,
          opacity: layer.style.opacity ?? 0.95,
          weight: Math.max(1, layer.style.lineWidth ?? 2)
        })
      })

      geoJsonLayer.addTo(layerGroup)
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
    const L = this.leaflet
    const map = this.map

    if (!L || !map) {
      return
    }

    this.highlightLayer?.remove()
    this.highlightLayer = null

    if (!features.length) {
      return
    }

    this.highlightLayer = L.geoJSON(
      {
        type: 'FeatureCollection',
        features
      } as FeatureCollection,
      {
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {
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
    ).addTo(map)
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

  private resolveTileLayer(baseMap: BaseMapDescriptor | null): TileLayerConfig {
    if (baseMap?.imageryUrl) {
      return {
        attribution: this.resolveAttribution(baseMap),
        url: baseMap.imageryUrl
      }
    }

    if (baseMap?.id === 'imagery') {
      return {
        attribution: 'Tiles © Esri',
        maxZoom: 18,
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      }
    }

    if (baseMap?.id === 'light') {
      return {
        attribution: '© OpenStreetMap contributors © CARTO',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      }
    }

    return {
      attribution: '© OpenStreetMap contributors © CARTO',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    }
  }

  private resolveAttribution(baseMap: BaseMapDescriptor) {
    if (baseMap.id === 'imagery') {
      return 'Tiles © Esri'
    }

    return '© OpenStreetMap contributors © CARTO'
  }

  private normalizeView(view: Partial<MapViewState>): MapViewState {
    return {
      ...this.view,
      ...view,
      bearing: 0,
      pitch: 0
    }
  }

  private toLeafletCenter(view: MapViewState): LatLngTuple {
    return [view.center.lat, view.center.lng]
  }
}
