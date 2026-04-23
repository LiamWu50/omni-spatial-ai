import { Inter } from 'next/font/google'

/**
 * Display Font - Circular/SpotifyMixUI fallback
 * Spotify uses proprietary CircularSp fonts with extensive fallbacks
 * We use Inter as a close approximation for web
 * Used for: Headlines, buttons, display text
 * Characteristics: Geometric, rounded, clean
 */
export const displayFont = Inter({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal'],
})

/**
 * Body Font - Circular/SpotifyMixUI fallback
 * Same font family for display and body (Spotify approach)
 * Used for: Body text, descriptions, labels, captions
 * Characteristics: Geometric sans-serif, clean, readable
 */
export const bodyFont = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
})

export const fonts = {
  display: displayFont,
  body: bodyFont,
}
