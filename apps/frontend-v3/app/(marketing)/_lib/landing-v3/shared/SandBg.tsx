/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

// @ts-ignore
import sand1Src from '../images/sand-1.jpg'
// @ts-ignore
import sand2Src from '../images/sand-2.jpg'
// @ts-ignore
import sand3Src from '../images/sand-3.jpg'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'

export function SandBg({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  const src = variant === 1 ? sand1Src : variant === 2 ? sand2Src : sand3Src
  const colorMode = useThemeColorMode()
  const overlayBg = colorMode === 'dark' ? 'hsla(216,12%,25%,1)' : '#EFEDE6'

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={src?.src ?? src}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'grayscale(100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayBg,
          opacity: 0.9,
          zIndex: 1,
        }}
      />
    </>
  )
}
