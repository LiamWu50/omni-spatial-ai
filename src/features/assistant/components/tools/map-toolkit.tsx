'use client'

import { type Toolkit } from '@assistant-ui/react'
import { CheckCircle2, Layers, Loader, type LucideIcon, MapPin, Palette } from 'lucide-react'

import { mapAssistantToolMetadata, type MapAssistantToolName } from '@/lib/ai/contracts'

type ToolCardConfig = {
  icon: LucideIcon
  displayName: string
}

const mapAssistantToolCardConfig = {
  map_view_control: {
    icon: MapPin,
    displayName: '地图视角控制'
  },
  map_layer_load: {
    icon: Layers,
    displayName: '加载图层'
  },
  map_layer_style: {
    icon: Palette,
    displayName: '更新图层样式'
  }
} satisfies Record<MapAssistantToolName, ToolCardConfig>

function buildToolCard(
  toolName: MapAssistantToolName,
  _args: unknown,
  _result: unknown,
  status: { type: 'running' | 'complete' | 'incomplete' | 'requires-action' }
) {
  const config = mapAssistantToolCardConfig[toolName]
  const StatusIcon = status.type === 'complete' ? CheckCircle2 : Loader
  const iconClassName =
    status.type === 'complete' ? 'text-emerald-400' : status.type === 'incomplete' ? 'text-red-400' : 'text-400'

  return (
    <div className='mb-2 w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/75 shadow-sm backdrop-blur-md'>
      <div className='flex items-center gap-2.5 px-3 py-2'>
        <div className={`shrink-0 ${iconClassName}`}>
          <StatusIcon size={14} className={status.type === 'running' ? 'animate-spin' : undefined} />
        </div>
        <div className='min-w-0 flex-1'>
          <span className='block truncate text-[12px] leading-5 text-neutral-200'>{config.displayName}</span>
        </div>
      </div>
    </div>
  )
}

export const mapAssistantToolkit: Toolkit = {
  map_view_control: {
    description: mapAssistantToolMetadata.map_view_control.description,
    parameters: mapAssistantToolMetadata.map_view_control.parameters,
    render: ({ args, result, status }) => buildToolCard('map_view_control', args, result, status)
  },
  map_layer_load: {
    description: mapAssistantToolMetadata.map_layer_load.description,
    parameters: mapAssistantToolMetadata.map_layer_load.parameters,
    render: ({ args, result, status }) => buildToolCard('map_layer_load', args, result, status)
  },
  map_layer_style: {
    description: mapAssistantToolMetadata.map_layer_style.description,
    parameters: mapAssistantToolMetadata.map_layer_style.parameters,
    render: ({ args, result, status }) => buildToolCard('map_layer_style', args, result, status)
  }
}
