import type { Map as LeafletMap } from 'leaflet'

import { setMapCursor } from './tool-controllers-shared'

type LeafletMouseEvent = import('leaflet').LeafletMouseEvent

export class PointDrawSession {
  private readonly map: LeafletMap

  private readonly onCreate: (point: import('leaflet').LatLng) => void

  constructor(map: LeafletMap, onCreate: (point: import('leaflet').LatLng) => void) {
    this.map = map
    this.onCreate = onCreate
  }

  start() {
    setMapCursor(this.map, 'crosshair')
    this.map.on('click', this.handleClick)
  }

  destroy() {
    this.map.off('click', this.handleClick)
    setMapCursor(this.map, '')
  }

  private readonly handleClick = (event: LeafletMouseEvent) => {
    this.onCreate(event.latlng)
  }
}
