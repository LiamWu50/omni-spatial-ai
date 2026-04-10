import './globals.css'

import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { displayFont, bodyFont } from './fonts'

export const metadata: Metadata = {
  title: 'OmniSpatial AI',
  description: 'AI驱动的空间智能操作系统'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-CN' suppressHydrationWarning className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className='antialiased font-sans'>
        <Suspense fallback={null}>
          <NuqsAdapter>
            <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
            </ThemeProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  )
}
