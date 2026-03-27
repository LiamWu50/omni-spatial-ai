'use client'

import { Upload } from 'lucide-react'
import { type RefObject, useState } from 'react'

import { cn } from '@/lib/utils'

import { LAYER_UPLOAD_ACCEPT } from '../../lib/constants'

interface LayerUploadDropzoneProps {
  importStatus: string
  inputRef: RefObject<HTMLInputElement | null>
  onImportLayers: (files: File[]) => Promise<void> | void
}

export function Uploader({ importStatus, inputRef, onImportLayers }: LayerUploadDropzoneProps) {
  const [dragging, setDragging] = useState(false)

  async function handleFiles(files: FileList | File[]) {
    const nextFiles = Array.from(files)

    if (nextFiles.length === 0) {
      return
    }

    await onImportLayers(nextFiles)
  }

  return (
    <section>
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
          'flex w-full items-center gap-3 rounded-[16px] border border-dashed px-3 py-3 text-left transition-[background-color,border-color,color] duration-200',
          dragging
            ? 'border-[var(--module-panel-border-strong)] bg-[var(--module-button-hover-bg)]'
            : 'border-[var(--module-panel-border)] bg-[var(--module-panel-bg-subtle)]'
        )}
      >
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--module-panel-bg-muted)] text-[var(--module-panel-icon)]'>
          <Upload className='h-4.5 w-4.5' />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='truncate text-sm font-medium text-neutral-900 dark:text-neutral-50'>上传 GeoJSON / JSON</div>
          <div className='truncate text-xs leading-5 text-[var(--module-panel-text-muted)]'>{importStatus}</div>
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
  )
}
