'use client'

import { useState } from 'react'

import { createActionMeta, type GeoJsonFeatureCollection, type LayerDescriptor } from '@/lib/gis/schema'
import { actionBus } from '@/lib/map/event-bus'

function normalizeRowsToGeoJson(rows: Record<string, unknown>[]): GeoJsonFeatureCollection {
  const features: GeoJsonFeatureCollection['features'] = []

  rows.forEach((row, index) => {
    const lng = Number(row.lng ?? row.lon ?? row.longitude)
    const lat = Number(row.lat ?? row.latitude)

    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      return
    }

    features.push({
      type: 'Feature' as const,
      properties: {
        ...row,
        rowIndex: index + 1
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat]
      }
    })
  })

  return {
    type: 'FeatureCollection',
    features
  }
}

function computeBbox(featureCollection: GeoJsonFeatureCollection): [number, number, number, number] | null {
  const coordinates = featureCollection.features.flatMap((feature) => {
    if (feature.geometry.type === 'Point') {
      return [feature.geometry.coordinates as [number, number]]
    }
    return []
  })

  if (coordinates.length === 0) {
    return null
  }

  const lngs = coordinates.map(([lng]) => lng)
  const lats = coordinates.map(([, lat]) => lat)

  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)]
}

export function FileImporter() {
  const [status, setStatus] = useState('支持 GeoJSON / JSON / XLSX')

  async function handleFile(file: File) {
    const lowerName = file.name.toLowerCase()
    let collection: GeoJsonFeatureCollection | null = null

    if (lowerName.endsWith('.geojson') || lowerName.endsWith('.json')) {
      const text = await file.text()
      collection = JSON.parse(text) as GeoJsonFeatureCollection
    } else if (lowerName.endsWith('.xlsx')) {
      const xlsx = await import('xlsx')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = xlsx.read(arrayBuffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet)
      collection = normalizeRowsToGeoJson(rows)
    } else {
      setStatus('暂不支持该文件格式')
      return
    }

    const layer: LayerDescriptor = {
      id: 'uploaded-layer',
      name: file.name,
      sourceType: 'geojson',
      data: collection,
      geometryType: 'mixed',
      visible: true,
      style: {
        color: '#38bdf8',
        opacity: 0.85,
        radius: 6
      },
      crs: 'WGS84'
    }

    await actionBus.emit({
      type: 'ADD_LAYER',
      payload: {
        layer
      },
      meta: createActionMeta('ui')
    })

    const bbox = computeBbox(collection)
    if (bbox) {
      await actionBus.emit({
        type: 'FIT_BOUNDS',
        payload: {
          bounds: bbox
        },
        meta: createActionMeta('ui')
      })
    }

    setStatus(`已导入 ${file.name}，共 ${collection.features.length} 个要素`)
  }

  return (
    <section className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-semibold'>数据导入</h2>
        <span className='text-xs text-slate-400'>GeoJSON / Excel</span>
      </div>
      <label className='mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center transition hover:border-sky-400/60 hover:bg-sky-500/5'>
        <span className='text-sm font-medium'>点击上传空间数据</span>
        <span className='mt-1 text-xs text-slate-400'>Excel 默认识别 lng/lat 或 longitude/latitude 列</span>
        <input
          type='file'
          className='hidden'
          accept='.geojson,.json,.xlsx'
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void handleFile(file)
            }
          }}
        />
      </label>
      <p className='mt-3 text-xs text-slate-400'>{status}</p>
    </section>
  )
}
