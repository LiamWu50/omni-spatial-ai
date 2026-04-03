'use client'

import { FileUp, X } from 'lucide-react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { Uploader } from './uploader'

interface UploadDialogProps {
  importStatus: string
  onImportLayers: (files: File[]) => Promise<void> | void
  triggerClassName?: string
}

export function UploadDialog({ importStatus, onImportLayers, triggerClassName }: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          size='icon'
          variant='secondary'
          title='上传图层'
          aria-label='上传图层'
          className={triggerClassName}
        >
          <FileUp className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className='overflow-hidden rounded-[12px] border-(--module-panel-border) bg-(--module-panel-bg) shadow-(--module-panel-shadow) backdrop-blur-[20px] duration-200 data-[state=closed]:slide-out-to-top-2 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-4 data-[state=open]:zoom-in-95 sm:max-w-[440px]'
      >
        <DialogHeader className='gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <DialogTitle className='text-base leading-none text-(--module-panel-text)'>上传图层</DialogTitle>
            <DialogClose asChild>
              <button
                type='button'
                aria-label='关闭上传图层弹窗'
                className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-(--module-panel-icon) transition-[background-color,border-color,color,box-shadow] duration-200 hover:bg-(--module-button-hover-bg) hover:text-(--module-button-hover-text)'
              >
                <X className='h-4 w-4' />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className='text-(--module-panel-text-muted)'>
            支持点击选择或拖拽导入 GeoJSON / JSON 文件
          </DialogDescription>
        </DialogHeader>

        <Uploader inputRef={inputRef} onImportLayers={onImportLayers} importStatus={importStatus} />
      </DialogContent>
    </Dialog>
  )
}
