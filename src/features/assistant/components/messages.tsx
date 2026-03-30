'use client'

import { MessagePrimitive, type Toolkit } from '@assistant-ui/react'
import { CheckCircle2, Layers, MapPin, Palette, type LucideIcon } from 'lucide-react'

import {
  mapAssistantToolMetadata,
  type MapAssistantToolName,
  type MapLayerLoadInput,
  type MapLayerStyleInput,
  type MapViewControlInput,
  type ToolExecutionResult
} from '../lib/contracts'

type ToolCardConfig<TArgs> = {
  icon: LucideIcon
  containerClassName: string
  pendingIconClassName: string
  completeIconClassName: string
  pendingLabel: (args: TArgs) => string
  completeLabel: (args: TArgs, result?: ToolExecutionResult) => string
  failedLabel: (args: TArgs, result?: ToolExecutionResult) => string
}

const mapAssistantToolCardConfig = {
  map_view_control: {
    icon: MapPin,
    containerClassName: 'border-blue-500/20 bg-blue-500/5',
    pendingIconClassName: 'bg-blue-500 text-white',
    completeIconClassName: 'bg-blue-500/10 text-blue-500',
    pendingLabel: (args: MapViewControlInput) => {
      const targetName = args.action === 'fly_to'
        ? args.target.type === 'place'
          ? args.target.query
          : '目标坐标'
        : '地图'

      if (args.action === 'reset_view') {
        return '正在重置地图视角...'
      }

      if (args.action === 'locate_user') {
        return '正在定位当前位置...'
      }

      return `正在带你飞往 ${targetName}...`
    },
    completeLabel: (args: MapViewControlInput, result?: ToolExecutionResult) =>
      result?.message ??
      (args.action === 'reset_view'
        ? '已准备回到地图初始视角。'
        : args.action === 'locate_user'
          ? '已准备定位到用户当前位置。'
          : '已准备调整地图视角。'),
    failedLabel: (_args: MapViewControlInput, result?: ToolExecutionResult) =>
      result?.message ?? '地图视角调整失败，请稍后重试。'
  },
  map_layer_load: {
    icon: Layers,
    containerClassName: 'border-indigo-500/20 bg-indigo-500/5',
    pendingIconClassName: 'bg-indigo-500 text-white',
    completeIconClassName: 'bg-indigo-500/10 text-indigo-500',
    pendingLabel: (args: MapLayerLoadInput) =>
      `正在加载图层数据: ${args.name || (args.source.type === 'system' ? args.source.datasetId : 'GeoJSON')}...`,
    completeLabel: (_args: MapLayerLoadInput, result?: ToolExecutionResult) =>
      result?.message ?? '已准备加载图层。',
    failedLabel: (_args: MapLayerLoadInput, result?: ToolExecutionResult) =>
      result?.message ?? '图层加载失败，请检查数据源后重试。'
  },
  map_layer_style: {
    icon: Palette,
    containerClassName: 'border-fuchsia-500/20 bg-fuchsia-500/5',
    pendingIconClassName: 'bg-fuchsia-500 text-white',
    completeIconClassName: 'bg-fuchsia-500/10 text-fuchsia-500',
    pendingLabel: (args: MapLayerStyleInput) => `正在更新图层 ${args.layerId} 的样式...`,
    completeLabel: (_args: MapLayerStyleInput, result?: ToolExecutionResult) =>
      result?.message ?? '已准备更新图层样式。',
    failedLabel: (_args: MapLayerStyleInput, result?: ToolExecutionResult) =>
      result?.message ?? '图层样式更新失败，请稍后重试。'
  }
} satisfies {
  [K in MapAssistantToolName]: ToolCardConfig<
    K extends 'map_view_control'
      ? MapViewControlInput
      : K extends 'map_layer_load'
        ? MapLayerLoadInput
        : MapLayerStyleInput
  >
}

function buildToolCard<TArgs>(
  toolName: MapAssistantToolName,
  args: TArgs,
  result: ToolExecutionResult | undefined,
  status: { type: 'running' | 'complete' | 'incomplete' | 'requires-action' }
) {
  const config = mapAssistantToolCardConfig[toolName] as ToolCardConfig<TArgs>
  const Icon = config.icon
  const isDone = status.type === 'complete'
  const iconClassName = isDone ? config.completeIconClassName : config.pendingIconClassName

  const label =
    status.type === 'complete'
      ? config.completeLabel(args, result)
      : status.type === 'incomplete'
        ? config.failedLabel(args, result)
        : config.pendingLabel(args)

  return (
    <div className={`mb-2 w-max max-w-sm overflow-hidden rounded-xl border shadow-sm backdrop-blur-md ${config.containerClassName}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
          {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</span>
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

export function MapAssistantMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full flex-col items-start'>
      <div className='max-w-[90%] rounded-2xl border border-(--module-panel-border) bg-(--module-panel-bg-subtle) px-3 py-2 text-sm leading-6 text-neutral-900 backdrop-blur dark:text-neutral-50'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

export function MapUserMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-end'>
      <div className='max-w-[90%] rounded-2xl bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}
