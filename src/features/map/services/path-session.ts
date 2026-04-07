import type { FeatureGroup, Map as LeafletMap } from 'leaflet'

import type { PathSessionOptions } from './tool-controllers-shared'
import { getPixelDistance, setMapCursor } from './tool-controllers-shared'
import { getPathGeometryType, isClosedPath } from './tool-geometry'

type LeafletModule = typeof import('leaflet')
type LeafletMouseEvent = import('leaflet').LeafletMouseEvent

const DUPLICATE_CLICK_TOLERANCE_PX = 4
const DUPLICATE_CLICK_INTERVAL_MS = 260
const CLOSE_PATH_TOLERANCE_PX = 12

export class PathSession {
  private readonly map: LeafletMap

  private readonly leaflet: LeafletModule

  private readonly options: PathSessionOptions

  private readonly previewGroup: FeatureGroup

  private readonly previewLine: import('leaflet').Polyline

  private readonly previewPolygon: import('leaflet').Polygon

  private readonly vertexGroup: FeatureGroup

  private vertices: import('leaflet').LatLng[] = []

  private pointer: import('leaflet').LatLng | null = null

  private lastAddedPoint: import('leaflet').LatLng | null = null

  private lastAddedAt = 0

  private previousTabIndex: string | null = null

  private doubleClickZoomEnabled = false

  constructor(map: LeafletMap, leaflet: LeafletModule, options: PathSessionOptions) {
    this.map = map
    this.leaflet = leaflet
    this.options = options
    this.previewGroup = leaflet.featureGroup().addTo(map)
    this.vertexGroup = leaflet.featureGroup().addTo(map)
    this.previewLine = leaflet.polyline([], {
      color: options.color,
      opacity: 0.95,
      weight: 3,
      className: 'map-tool-preview-line'
    })
    this.previewPolygon = leaflet.polygon([], {
      color: options.fillColor,
      fillColor: options.fillColor,
      fillOpacity: options.fillOpacity,
      opacity: 0.9,
      weight: 2,
      className: 'map-tool-preview-polygon'
    })
    this.previewGroup.addLayer(this.previewLine)
    this.previewGroup.addLayer(this.previewPolygon)
  }

  start() {
    const container = this.map.getContainer()

    this.previousTabIndex = container.getAttribute('tabindex')
    container.setAttribute('tabindex', '0')
    container.focus()
    setMapCursor(this.map, 'crosshair')

    this.doubleClickZoomEnabled = this.map.doubleClickZoom.enabled()
    if (this.doubleClickZoomEnabled) {
      this.map.doubleClickZoom.disable()
    }

    this.map.on('click', this.handleClick)
    this.map.on('mousemove', this.handleMouseMove)
    this.map.on('dblclick', this.handleDoubleClick)
    container.addEventListener('keydown', this.handleKeyDown)
  }

  destroy() {
    const container = this.map.getContainer()

    this.map.off('click', this.handleClick)
    this.map.off('mousemove', this.handleMouseMove)
    this.map.off('dblclick', this.handleDoubleClick)
    container.removeEventListener('keydown', this.handleKeyDown)

    if (this.doubleClickZoomEnabled) {
      this.map.doubleClickZoom.enable()
    }

    if (this.previousTabIndex === null) {
      container.removeAttribute('tabindex')
    } else {
      container.setAttribute('tabindex', this.previousTabIndex)
    }

    setMapCursor(this.map, '')
    this.previewGroup.clearLayers()
    this.vertexGroup.clearLayers()
    this.previewGroup.remove()
    this.vertexGroup.remove()
    this.reset()
  }

  private readonly handleClick = (event: LeafletMouseEvent) => {
    const nextPoint = event.latlng

    if (this.shouldIgnoreDuplicateClick(nextPoint)) {
      return
    }

    if (this.shouldClosePathOnClick(nextPoint)) {
      this.finish(true)
      return
    }

    this.vertices = [...this.vertices, nextPoint]
    this.lastAddedPoint = nextPoint
    this.lastAddedAt = Date.now()
    this.pointer = nextPoint
    this.render()
  }

  private readonly handleMouseMove = (event: LeafletMouseEvent) => {
    this.pointer = event.latlng
    this.render()
  }

  private readonly handleDoubleClick = () => {
    this.finish()
  }

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return
    }

    event.preventDefault()
    this.reset()
  }

  private shouldIgnoreDuplicateClick(nextPoint: import('leaflet').LatLng) {
    if (!this.lastAddedPoint) {
      return false
    }

    if (Date.now() - this.lastAddedAt > DUPLICATE_CLICK_INTERVAL_MS) {
      return false
    }

    return getPixelDistance(this.map, this.lastAddedPoint, nextPoint) <= DUPLICATE_CLICK_TOLERANCE_PX
  }

  private shouldClosePathOnClick(nextPoint: import('leaflet').LatLng) {
    if (this.vertices.length < 3) {
      return false
    }

    return getPixelDistance(this.map, this.vertices[0], nextPoint) <= CLOSE_PATH_TOLERANCE_PX
  }

  private finish(forceClosed = false) {
    const closed = forceClosed || isClosedPath(this.vertices, (point) => this.map.latLngToContainerPoint(point))

    this.pointer = null
    this.render()
    this.options.onComplete([...this.vertices], closed)

    if (this.options.singleShot) {
      this.destroy()
      return
    }

    this.reset()
  }

  private reset() {
    this.vertices = []
    this.pointer = null
    this.lastAddedPoint = null
    this.lastAddedAt = 0
    this.previewLine.setLatLngs([])
    this.previewPolygon.setLatLngs([])
    this.vertexGroup.clearLayers()
  }

  private render() {
    this.previewLine.setLatLngs(this.getPreviewLinePoints())
    this.previewPolygon.setLatLngs(this.getPreviewPolygonPoints())
    this.renderVertexes()
  }

  private getPreviewLinePoints() {
    if (this.vertices.length === 0) {
      return []
    }

    return this.pointer ? [...this.vertices, this.pointer] : this.vertices
  }

  private getPreviewPolygonPoints() {
    if (!this.pointer || this.vertices.length < 2) {
      return []
    }

    const points = [...this.vertices, this.pointer]
    const closed = isClosedPath(points, (point) => this.map.latLngToContainerPoint(point))

    if (!closed || getPathGeometryType(points, true) !== 'polygon') {
      return []
    }

    return points
  }

  private renderVertexes() {
    this.vertexGroup.clearLayers()

    for (const point of this.vertices) {
      const marker = this.leaflet.circleMarker(point, {
        color: '#ffffff',
        fillColor: this.options.color,
        fillOpacity: 1,
        opacity: 1,
        radius: 5,
        weight: 2,
        className: 'map-tool-preview-vertex'
      })

      this.vertexGroup.addLayer(marker)
    }
  }
}
