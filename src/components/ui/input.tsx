import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'placeholder:text-text-disabled selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 rounded-full border border-border bg-transparent px-4 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-body',
        'focus-visible:border-border-strong focus-visible:shadow-[var(--shadow-inset)] focus-visible:ring-0',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export { Input }
