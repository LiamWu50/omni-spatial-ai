import type { Feature, Geometry } from 'geojson'
import type { DivIcon, FeatureGroup, Layer, LayerGroup, Map as LeafletMap } from 'leaflet'

import type { GeoJsonFeatureCollection, LayerDescriptor } from '@/lib/gis/schema'

import {
  buildDrawMarkerIconHtml,
  createDrawLayerFromFeature,
  createMeasureLayerFromResult,
  extractBoundsFromLayer,
  getLayerSummary,
  isDrawLayer,
  isMeasureLayer,
  readManagedOriginFromFeature
} from '../../lib/user-layers'
import type { MapTool } from '../../types'
import {
  buildFeatureFromPath,
  buildMeasureMetrics,
  buildPointFeature,
  getFeatureCentroid,
  getPathGeometryType,
  isClosedPath
} from './tool-geometry'
import type { MapToolController } from './tool-registry'

type LeafletModule = typeof import('leaflet')
type LeafletMouseEvent = import('leaflet').LeafletMouseEvent

interface ManagedToolLayerCallbacks {
  onAddLayer: (layer: LayerDescriptor) => Promise<void> | void
  onRemoveLayer: (_layerId: string) => Promise<void> | void
  onUpdateLayer: (_layer: LayerDescriptor) => Promise<void> | void
  onRequestToolChange?: (tool: MapTool | null) => void
}

interface PathSessionOptions {
  color: string
  fillColor: string
  fillOpacity: number
  onComplete: (points: import('leaflet').LatLng[], closed: boolean) => void
  singleShot?: boolean
}

interface RenderSyncOptions {
  group: FeatureGroup | null
  layers: Iterable<LayerDescriptor>
  leaflet: LeafletModule | null
  includeMeasureLabel?: boolean
  useMarkerForPoint?: boolean
}

const DRAW_COLOR = '#8b5cf6'
const MEASURE_COLOR = '#f59e0b'
const DUPLICATE_CLICK_TOLERANCE_PX = 4
const DUPLICATE_CLICK_INTERVAL_MS = 260
const CLOSE_PATH_TOLERANCE_PX = 12

function createMarkerIcon(leaflet: LeafletModule): DivIcon {
  return leaflet.divIcon({
    className: 'map-draw-marker',
    html: buildDrawMarkerIconHtml(),
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  })
}

function createPathStyle(layer: LayerDescriptor) {
  const isDrawResult = isDrawLayer(layer)
  const isMeasureResult = isMeasureLayer(layer)
  const isPolygon = layer.geometryType === 'polygon'
  const fillOpacity = !isPolygon ? 0 : isDrawResult ? 0.18 : isMeasureResult ? 0.14 : 0.24

  return {
    color: layer.style.color ?? '#60a5fa',
    fillColor: layer.style.color ?? '#60a5fa',
    fill: isPolygon,
    opacity: layer.style.opacity ?? 0.95,
    fillOpacity,
    stroke: true,
    weight: Math.max(1, layer.style.lineWidth ?? 2)
  }
}

function extractSingleLayer(leafletLayerGroup: LayerGroup) {
  let currentLayer: Layer | null = null

  leafletLayerGroup.eachLayer((childLayer) => {
    currentLayer = childLayer
  })

  return currentLayer
}

function createRenderableLeafletLayer(leaflet: LeafletModule, layer: LayerDescriptor, useMarkerForPoint = false) {
  const geoJsonLayer = leaflet.geoJSON(layer.data as GeoJsonFeatureCollection, {
    pointToLayer: (_feature, latlng) =>
      useMarkerForPoint
        ? leaflet.marker(latlng, {
            icon: createMarkerIcon(leaflet)
          })
        : leaflet.circleMarker(latlng, {
            color: layer.style.color ?? '#60a5fa',
            fillColor: layer.style.color ?? '#60a5fa',
            fillOpacity: layer.style.opacity ?? 0.75,
            opacity: layer.style.opacity ?? 0.95,
            radius: layer.style.radius ?? 6,
            weight: Math.max(1, layer.style.lineWidth ?? 2)
          }),
    style: () => createPathStyle(layer)
  })

  return extractSingleLayer(geoJsonLayer)
}

function createMeasureLabelLayer(leaflet: LeafletModule, layer: LayerDescriptor) {
  const summary = getLayerSummary(layer)
  const latlng = getMeasureLabelLatLng(leaflet, layer)

  if (!summary || !latlng) {
    return null
  }

  const labelHtml = summary.replaceAll(' · ', '<span class="map-measure-label-separator">·</span><br />')

  return leaflet.marker(latlng, {
    interactive: false,
    keyboard: false,
    icon: leaflet.divIcon({
      className: 'map-measure-label-wrapper',
      html: `<span class="map-measure-label">${labelHtml}</span>`,
      iconSize: undefined
    })
  })
}

function syncVisibleLayers(options: RenderSyncOptions) {
  const { group, layers, leaflet, includeMeasureLabel = false, useMarkerForPoint = false } = options

  if (!group || !leaflet) {
    return
  }

  group.clearLayers()

  for (const layer of layers) {
    if (!layer.visible) {
      continue
    }

    const renderedLayer = createRenderableLeafletLayer(leaflet, layer, useMarkerForPoint)

    if (renderedLayer) {
      group.addLayer(renderedLayer)
    }

    if (includeMeasureLabel) {
      const labelLayer = createMeasureLabelLayer(leaflet, layer)

      if (labelLayer) {
        group.addLayer(labelLayer)
      }
    }
  }
}

function setMapCursor(map: LeafletMap, cursor: string) {
  map.getContainer().style.cursor = cursor
}

function getPixelDistance(map: LeafletMap, source: import('leaflet').LatLng, target: import('leaflet').LatLng) {
  const sourcePoint = map.latLngToContainerPoint(source)
  const targetPoint = map.latLngToContainerPoint(target)
  return sourcePoint.distanceTo(targetPoint)
}

function getMeasureLabelLatLng(leaflet: LeafletModule, layer: LayerDescriptor) {
  const collection = layer.data as GeoJsonFeatureCollection
  const feature = collection.features[0]

  if (!feature) {
    return null
  }

  const centroid = getFeatureCentroid(feature as Feature<Geometry>)

  if (centroid) {
    return leaflet.latLng(centroid[1], centroid[0])
  }

  const bounds = extractBoundsFromLayer(layer)
  return bounds ? leaflet.latLng((bounds[1] + bounds[3]) / 2, (bounds[0] + bounds[2]) / 2) : null
}

class PointDrawSession {
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

class PathSession {
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

export function shouldRenderInGenericLayerManager(layer: LayerDescriptor) {
  return readManagedOriginFromFeature(layer) === 'upload' || getLayerOrigin(layer) === null
}

function getLayerOrigin(layer: LayerDescriptor) {
  return isDrawLayer(layer) ? 'draw' : isMeasureLayer(layer) ? 'measure' : null
}
