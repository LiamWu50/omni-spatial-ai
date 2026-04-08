import type { BaseMapDescriptor } from '@/lib/gis/schema'

type LeafletModule = typeof import('leaflet')
type LeafletMap = import('leaflet').Map
type LeafletTileLayer = import('leaflet').TileLayer

type TileLayerConfig = {
  attribution: string
  maxZoom?: number
  subdomains?: string | string[]
  url: string
}

interface BaseMapManagerOptions {
  initialBaseMap: BaseMapDescriptor | null
  onBaseMapChange: (baseMap: BaseMapDescriptor | null) => void
}

export class BaseMapManager {
  private baseMap: BaseMapDescriptor | null

  private map: LeafletMap | null = null

  private leaflet: LeafletModule | null = null

  private activeBaseLayer: LeafletTileLayer | null = null

  private readonly onBaseMapChange: BaseMapManagerOptions['onBaseMapChange']

  constructor(options: BaseMapManagerOptions) {
    this.baseMap = options.initialBaseMap
    this.onBaseMapChange = options.onBaseMapChange
  }

  attach(map: LeafletMap, leaflet: LeafletModule) {
    this.map = map
    this.leaflet = leaflet
    this.syncBaseLayer()
  }

  detach() {
    this.activeBaseLayer?.remove()
    this.activeBaseLayer = null
    this.map = null
    this.leaflet = null
  }

  getBaseMap() {
    return this.baseMap
  }

  async setBaseMap(baseMap: BaseMapDescriptor) {
    this.baseMap = baseMap
    this.syncBaseLayer()
    this.onBaseMapChange(this.baseMap)
  }

  private syncBaseLayer() {
    if (!this.map || !this.leaflet) {
      return
    }

    this.activeBaseLayer?.remove()

    const tileConfig = this.resolveTileLayer(this.baseMap)
    this.activeBaseLayer = this.leaflet.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom ?? 20,
      subdomains: tileConfig.subdomains ?? 'abcd'
    })

    this.activeBaseLayer.addTo(this.map)
  }

  private resolveTileLayer(baseMap: BaseMapDescriptor | null): TileLayerConfig {
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
}
