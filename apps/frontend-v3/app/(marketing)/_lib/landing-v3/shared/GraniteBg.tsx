/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

// @ts-ignore
import graniteSrc from '../images/granite-1.jpg'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'

export function GraniteBg() {
  const colorMode = useThemeColorMode()
  const overlayBg = colorMode === 'dark' ? 'hsla(216,12%,25%,1)' : '#EFEDE6'

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={graniteSrc?.src ?? graniteSrc}
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
        }}
      />
    </>
  )
}
