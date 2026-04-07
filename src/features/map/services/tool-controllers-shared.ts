import type { DivIcon, FeatureGroup, Layer, LayerGroup } from 'leaflet'

import type { GeoJsonFeatureCollection, LayerDescriptor } from '@/lib/gis/schema'

import {
  buildDrawMarkerIconHtml,
  extractBoundsFromLayer,
  getLayerMeasureLabel,
  isDrawLayer,
  isMeasureLayer,
  readManagedOriginFromFeature
} from '../lib/user-layers'
import { getFeatureCentroid } from './tool-geometry'

type LeafletModule = typeof import('leaflet')

export interface ManagedToolLayerCallbacks {
  onAddLayer: (layer: LayerDescriptor) => Promise<void> | void
  onRemoveLayer: (_layerId: string) => Promise<void> | void
  onUpdateLayer: (_layer: LayerDescriptor) => Promise<void> | void
  onRequestToolChange?: (tool: import('../types').MapTool | null) => void
}

export interface PathSessionOptions {
  color: string
  fillColor: string
  fillOpacity: number
  onComplete: (points: import('leaflet').LatLng[], closed: boolean) => void
  singleShot?: boolean
}

export interface RenderSyncOptions {
  group: FeatureGroup | null
  layers: Iterable<LayerDescriptor>
  leaflet: LeafletModule | null
  includeMeasureLabel?: boolean
  useMarkerForPoint?: boolean
}

const DRAW_COLOR = '#8b5cf6'
const MEASURE_COLOR = '#f59e0b'

export { DRAW_COLOR, MEASURE_COLOR }

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
    fillColor: layer.style.fillColor ?? layer.style.color ?? '#60a5fa',
    fill: isPolygon,
    opacity: layer.style.opacity ?? 0.95,
    fillOpacity: layer.style.fillOpacity ?? fillOpacity,
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

export function createRenderableLeafletLayer(
  leaflet: LeafletModule,
  layer: LayerDescriptor,
  useMarkerForPoint = false
) {
  const geoJsonLayer = leaflet.geoJSON(layer.data as GeoJsonFeatureCollection, {
    pointToLayer: (_feature, latlng) =>
      useMarkerForPoint
        ? leaflet.marker(latlng, {
            icon: createMarkerIcon(leaflet)
          })
        : leaflet.circleMarker(latlng, {
            color: layer.style.color ?? '#60a5fa',
            fillColor: layer.style.fillColor ?? layer.style.color ?? '#60a5fa',
            fillOpacity: layer.style.fillOpacity ?? layer.style.opacity ?? 0.75,
            opacity: layer.style.opacity ?? 0.95,
            radius: layer.style.radius ?? 6,
            weight: Math.max(1, layer.style.lineWidth ?? 2)
          }),
    style: () => createPathStyle(layer)
  })

  return extractSingleLayer(geoJsonLayer)
}

function createMeasureLabelLayer(leaflet: LeafletModule, layer: LayerDescriptor) {
  const measureLabel = getLayerMeasureLabelImpl(layer)
  const latlng = getMeasureLabelLatLng(leaflet, layer)

  if (!measureLabel || !latlng) {
    return null
  }

  const labelHtml = measureLabel.replaceAll(' · ', '<span class="map-measure-label-separator">·</span><br />')

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

function getMeasureLabelLatLng(leaflet: LeafletModule, layer: LayerDescriptor) {
  const collection = layer.data as GeoJsonFeatureCollection
  const feature = collection.features[0]

  if (!feature) {
    return null
  }

  try {
    const centroid = getFeatureCentroid(feature as any)

    if (centroid) {
      return leaflet.latLng(centroid[1], centroid[0])
    }
  } catch {
    // Ignore geometry parsing errors
  }

  const bounds = extractBoundsFromLayer(layer)
  return bounds ? leaflet.latLng((bounds[1] + bounds[3]) / 2, (bounds[0] + bounds[2]) / 2) : null
}

function getLayerMeasureLabelImpl(layer: LayerDescriptor) {
  return getLayerMeasureLabel(layer)
}

export function syncVisibleLayers(options: RenderSyncOptions) {
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

export function setMapCursor(map: import('leaflet').Map, cursor: string) {
  map.getContainer().style.cursor = cursor
}

export function getPixelDistance(
  map: import('leaflet').Map,
  source: import('leaflet').LatLng,
  target: import('leaflet').LatLng
) {
  const sourcePoint = map.latLngToContainerPoint(source)
  const targetPoint = map.latLngToContainerPoint(target)
  return sourcePoint.distanceTo(targetPoint)
}

export function shouldRenderInGenericLayerManager(layer: LayerDescriptor) {
  return readManagedOriginFromFeature(layer) === 'upload' || getLayerOrigin(layer) === null
}

function getLayerOrigin(layer: LayerDescriptor) {
  return isDrawLayer(layer) ? 'draw' : isMeasureLayer(layer) ? 'measure' : null
}
