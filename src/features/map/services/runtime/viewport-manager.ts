import type { BBox, MapViewState } from '@/lib/gis/schema'

type LeafletMap = import('leaflet').Map
type LatLngTuple = [number, number]

interface ViewportManagerOptions {
  initialView: MapViewState
  onViewChange: (view: MapViewState) => void
}

export class ViewportManager {
  private static readonly DEFAULT_VIEW: MapViewState = {
    center: {
      lng: 116.397389,
      lat: 39.908722
    },
    zoom: 10,
    bearing: 0,
    pitch: 0
  }

  private view: MapViewState

  private map: LeafletMap | null = null

  private detachMapEvents: (() => void) | null = null

  private readonly onViewChange: ViewportManagerOptions['onViewChange']

  constructor(options: ViewportManagerOptions) {
    this.view = this.normalizeView(options.initialView)
    this.onViewChange = options.onViewChange
  }

  attach(map: LeafletMap) {
    this.map = map
    this.bindMapEvents()
    this.applyViewToMap(false)
  }

  detach() {
    this.detachMapEvents?.()
    this.detachMapEvents = null
    this.map = null
  }

  getView() {
    return this.view
  }

  async setView(state: Partial<MapViewState>) {
    this.view = this.normalizeView({
      ...this.view,
      ...state
    })

    this.applyViewToMap()
    this.onViewChange(this.view)
  }

  async fitBounds(bounds: BBox) {
    const [minLng, minLat, maxLng, maxLat] = bounds

    this.view = this.normalizeView({
      ...this.view,
      center: {
        lng: (minLng + maxLng) / 2,
        lat: (minLat + maxLat) / 2
      },
      bounds
    })

    if (this.map) {
      this.map.fitBounds(
        [
          [bounds[1], bounds[0]],
          [bounds[3], bounds[2]]
        ],
        {
          animate: true,
          padding: [32, 32]
        }
      )
    }

    this.onViewChange(this.view)
  }

  private bindMapEvents() {
    if (!this.map) {
      return
    }

    const handleMoveEnd = () => {
      if (!this.map) {
        return
      }

      const center = this.map.getCenter()
      this.view = this.normalizeView({
        ...this.view,
        center: {
          lng: center.lng,
          lat: center.lat
        },
        zoom: this.map.getZoom()
      })
      this.onViewChange(this.view)
    }

    this.map.on('moveend zoomend', handleMoveEnd)

    this.detachMapEvents = () => {
      this.map?.off('moveend zoomend', handleMoveEnd)
    }
  }

  private applyViewToMap(animate = true) {
    if (!this.map) {
      return
    }

    this.map.setView(this.toLeafletCenter(this.view), this.view.zoom, {
      animate
    })
  }

  private normalizeView(view: Partial<MapViewState>): MapViewState {
    return {
      ...ViewportManager.DEFAULT_VIEW,
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
