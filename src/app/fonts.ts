import { Inter, JetBrains_Mono } from 'next/font/google'

/**
 * Display Font - JetBrains Mono
 * Used for: Headlines, buttons, display text
 * Characteristics: Monospace, technical, commanding
 * Alternative to GeistMono, available via Google Fonts
 */
export const displayFont = JetBrains_Mono({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
})

/**
 * Body Font - Inter
 * Used for: Body text, descriptions, labels, captions
 * Characteristics: Geometric sans-serif, clean, readable
 */
export const bodyFont = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
})

export const fonts = {
  display: displayFont,
  body: bodyFont,
}
