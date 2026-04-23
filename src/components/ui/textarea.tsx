import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'placeholder:text-text-disabled focus-visible:border-border-strong focus-visible:shadow-[var(--shadow-inset)] focus-visible:ring-0 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-[6px] border border-border bg-transparent px-3 py-2 text-base transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-body resize-none',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
