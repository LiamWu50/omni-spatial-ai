'use client'

import type { ToolCallMessagePartProps } from '@assistant-ui/react'
import { AlertCircle, CheckCircle2, LoaderCircle, Wrench } from 'lucide-react'

function formatToolName(toolName: string) {
  return toolName
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function ToolFallback({ toolName, result: _result, status }: ToolCallMessagePartProps) {
  const label = formatToolName(toolName)
  const Icon =
    status.type === 'complete'
      ? CheckCircle2
      : status.type === 'incomplete'
        ? AlertCircle
        : status.type === 'requires-action'
          ? Wrench
          : LoaderCircle
  const iconClassName =
    status.type === 'complete'
      ? 'text-emerald-400'
      : status.type === 'incomplete'
        ? 'text-red-400'
        : status.type === 'requires-action'
          ? 'text-amber-400'
          : 'text-cyan-400'

  return (
    <div className='mb-2 w-full max-w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/75 shadow-sm backdrop-blur-md'>
      <div className='flex items-center gap-2.5 px-4 py-2.5'>
        <div className={`shrink-0 ${iconClassName}`}>
          <Icon size={14} className={status.type === 'running' ? 'animate-spin' : undefined} />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='truncate text-[13px] leading-5 text-neutral-200'>{label}</div>
        </div>
      </div>
    </div>
  )
}
