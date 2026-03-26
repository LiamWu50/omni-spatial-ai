'use client'

import { Eye, EyeOff, FileUp, Search, Trash2, Upload, X } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { LAYER_UPLOAD_ACCEPT, LAYER_UPLOAD_MAX_SIZE_MB } from '../../lib/constants'
import type { UserLayerListItem } from '../../types'

interface LayerManagerPanelProps {
  layerManagerOpen: boolean
  uploadStatus: string
  userLayers: UserLayerListItem[]
  onToggleLayerManager: () => void
  onUploadFiles: (files: File[]) => Promise<void> | void
  onToggleUserLayer: (layerId: string) => Promise<void> | void
  onFocusUserLayer: (layerId: string) => Promise<void> | void
  onRemoveUserLayer: (layerId: string) => Promise<void> | void
}

export function LayerManagerPanel({
  layerManagerOpen,
  uploadStatus,
  userLayers,
  onToggleLayerManager,
  onUploadFiles,
  onToggleUserLayer,
  onFocusUserLayer,
  onRemoveUserLayer
}: LayerManagerPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const visibleLayerCount = userLayers.filter((layer) => layer.visible).length

  async function handleFiles(files: FileList | File[]) {
    const nextFiles = Array.from(files)

    if (nextFiles.length === 0) {
      return
    }

    await onUploadFiles(nextFiles)
  }

  return (
    <aside
      className={`absolute left-5 top-24 z-20 flex max-h-[calc(100vh-7rem)] w-[360px] flex-col overflow-hidden rounded-[28px] border border-[var(--module-panel-border)] bg-[var(--module-panel-bg)] shadow-[var(--module-panel-shadow)] backdrop-blur-[20px] transition-all duration-300 ${
        layerManagerOpen ? 'translate-x-0 opacity-100' : '-translate-x-[110%] opacity-0'
      }`}
    >
      <div className='flex items-center justify-between border-b border-[var(--module-panel-border)] px-5 py-4'>
        <div className='flex-1 text-center'>
          <div className='text-lg font-semibold text-neutral-900 dark:text-neutral-50'>Layer Management</div>
        </div>
        <button
          type='button'
          onClick={onToggleLayerManager}
          className='flex h-9 w-9 items-center justify-center rounded-full text-[var(--module-panel-icon)] transition-[background-color,border-color,color,box-shadow] duration-[180ms] hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)]'
          aria-label='关闭图层管理面板'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <ScrollArea className='min-h-0 flex-1'>
        <div className='space-y-5 px-4 py-4'>
          <section>
            <div className='mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50'>Upload Data</div>
            <button
              type='button'
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  return
                }
                setDragging(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                void handleFiles(event.dataTransfer.files)
              }}
              className={cn(
                'flex min-h-36 w-full flex-col items-center justify-center rounded-[20px] border border-dashed px-5 py-6 text-center transition-[background-color,border-color,color] duration-200',
                dragging
                  ? 'border-[var(--module-panel-border-strong)] bg-[var(--module-button-hover-bg)]'
                  : 'border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)]'
              )}
            >
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-[var(--module-panel-bg-muted)] text-[var(--module-panel-icon)]'>
                <Upload className='h-5 w-5' />
              </div>
              <div className='mt-4 text-sm font-medium text-neutral-900 dark:text-neutral-50'>
                Drag & drop or click to upload GeoJSON files
              </div>
              <div className='mt-2 text-xs leading-5 text-[var(--module-panel-text-muted)]'>
                Supports multiple files · Max size: {LAYER_UPLOAD_MAX_SIZE_MB} MB
              </div>
              <div className='text-xs leading-5 text-[var(--module-panel-text-muted)]'>Format: GeoJSON / JSON only</div>
              <div className='mt-4 rounded-full bg-[var(--module-panel-bg-muted)] px-3 py-1 text-xs text-[var(--module-panel-text-muted)]'>
                {uploadStatus}
              </div>
            </button>
            <input
              ref={inputRef}
              type='file'
              multiple
              accept={LAYER_UPLOAD_ACCEPT}
              className='hidden'
              onChange={(event) => {
                const files = event.target.files
                if (files) {
                  void handleFiles(files)
                }
                event.currentTarget.value = ''
              }}
            />
          </section>

          <div className='border-t border-[var(--module-panel-border)]' />

          <section>
            <div className='mb-3 flex items-center justify-between'>
              <div className='text-sm font-semibold text-neutral-900 dark:text-neutral-50'>User Layers</div>
              <div className='text-xs text-[var(--module-panel-text-muted)]'>
                {visibleLayerCount}/{userLayers.length} 可见
              </div>
            </div>

            {userLayers.length > 0 ? (
              <div className='space-y-3'>
                {userLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className='rounded-[20px] border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] px-4 py-3'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--module-panel-bg-muted)] text-[var(--module-panel-icon)]'>
                            <FileUp className='h-4 w-4' />
                          </div>
                          <div className='min-w-0'>
                            <div className='truncate text-sm font-medium text-neutral-900 dark:text-neutral-50'>
                              {layer.name}
                            </div>
                            <div className='mt-1 text-xs text-[var(--module-panel-text-muted)]'>
                              {layer.featureCount} 个要素 · {formatGeometryLabel(layer.geometryType)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-full bg-[var(--module-panel-bg-muted)] px-2.5 py-1 text-[11px] text-[var(--module-panel-text-muted)]'>
                        {layer.sourceType.toUpperCase()}
                      </div>
                    </div>

                    <div className='mt-3 flex items-center gap-1'>
                      <ActionButton
                        label='定位图层'
                        onClick={() => void onFocusUserLayer(layer.id)}
                        icon={<Search className='h-4 w-4' />}
                      />
                      <ActionButton
                        label={layer.visible ? '隐藏图层' : '显示图层'}
                        onClick={() => void onToggleUserLayer(layer.id)}
                        icon={layer.visible ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                      />
                      <ActionButton
                        label='删除图层'
                        onClick={() => void onRemoveUserLayer(layer.id)}
                        icon={<Trash2 className='h-4 w-4' />}
                        destructive
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-[20px] border border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)] px-4 py-8 text-center'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--module-panel-bg-muted)] text-[var(--module-panel-icon)]'>
                  <Upload className='h-5 w-5' />
                </div>
                <div className='mt-3 text-sm font-medium text-neutral-900 dark:text-neutral-50'>暂无用户图层</div>
                <div className='mt-2 text-xs leading-5 text-[var(--module-panel-text-muted)]'>
                  上传 GeoJSON 原始数据后，这里会展示你的图层列表。
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => inputRef.current?.click()}
                  className='mt-4 rounded-full border-[var(--module-panel-border)] bg-[var(--module-panel-bg-muted)]'
                >
                  <Upload className='h-4 w-4' />
                  立即上传
                </Button>
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </aside>
  )
}

function ActionButton({
  destructive = false,
  icon,
  label,
  onClick
}: {
  destructive?: boolean
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={onClick}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-[var(--module-panel-icon)] transition-[background-color,color] duration-200 hover:bg-[var(--module-button-hover-bg)] hover:text-[var(--module-button-hover-text)]',
            destructive ? 'text-rose-500 hover:bg-rose-500/10 hover:text-rose-500' : ''
          )}
          aria-label={label}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{label}</TooltipContent>
    </Tooltip>
  )
}

function formatGeometryLabel(geometryType: UserLayerListItem['geometryType']) {
  if (geometryType === 'point') {
    return '点'
  }

  if (geometryType === 'line') {
    return '线'
  }

  if (geometryType === 'polygon') {
    return '面'
  }

  return '混合几何'
}
