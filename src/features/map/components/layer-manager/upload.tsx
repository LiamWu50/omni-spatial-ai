'use client'

import { Upload } from 'lucide-react'
import { type RefObject, useState } from 'react'

import { cn } from '@/lib/utils'

import { LAYER_UPLOAD_ACCEPT, LAYER_UPLOAD_MAX_SIZE_MB } from '../../lib/constants'

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
          {importStatus}
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
