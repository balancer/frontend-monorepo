import { useColorModeValue } from '@chakra-ui/react'
import { CSSProperties, useId } from 'react'

export function usePoolTextures() {
  const marbleTexture = useColorModeValue(
    '/images/textures/marble-square.avif',
    '/images/textures/marble-square-dark.avif'
  )
  const rockTexture = useColorModeValue(
    '/images/textures/slate-square-small.avif',
    '/images/textures/slate-square-small-dark.avif'
  )
  const blendMode: CSSProperties['mixBlendMode'] = useColorModeValue('multiply', 'plus-lighter')
  return { marbleTexture, rockTexture, blendMode }
}

function SvgShadowFilter({ id }: { id: string }) {
  return (
    <filter height="full" id={id} width="full" x="0" y="0">
      <feOffset dx="2" dy="2" in="SourceAlpha" result="offOut" />
      <feColorMatrix
        in="offOut"
        result="matrixOut"
        type="matrix"
        values=" 0.5 0 0 0 0 0 0.5 0 0 0 0 0 0.5 0 0 0 0 0 0.2 0"
      />
      <feGaussianBlur in="matrixOut" result="blurOut" stdDeviation="4" />
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
    </filter>
  )
}

export function FeaturedPool1SVG() {
  const id = useId()
  const { marbleTexture, rockTexture, blendMode } = usePoolTextures()
  return (
    <svg
      className="featured-pool-svg"
      fill="none"
      height="142"
      overflow="visible"
      viewBox="0 0 142 142"
      width="142"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="path1">
        <path
          d="M16 56.01C16 26.1 39.86 1.78 69.58 1.03c.47-.01.95-.02 1.42-.02s.95.01 1.42.02c38 .75 68.58 31.79 68.58 69.98 0 38.19-30.58 69.23-68.58 69.98 29.72-.75 53.58-25.07 53.58-54.98 0-5.2-.72-10.23-2.07-15-6.4-22.65-26.95-39.36-51.51-39.98-.47-.01-.95-.02-1.42-.02s-.95.01-1.42.02C48.15 31.78 31 49.4 31 71.01c0 21.61 17.15 39.23 38.58 39.98-24.56-.62-45.11-17.33-51.51-39.98-1.35-4.77-2.07-9.8-2.07-15Z"
          fill={`url(#rock-texture-${id})`}
          filter={`url(#shadow-filter-${id})`}
          stroke="currentColor"
        />
        <path
          d="M16 56.01C16 26.1 39.86 1.78 69.58 1.03c.47-.01.95-.02 1.42-.02s.95.01 1.42.02c38 .75 68.58 31.79 68.58 69.98 0 38.19-30.58 69.23-68.58 69.98 29.72-.75 53.58-25.07 53.58-54.98 0-5.2-.72-10.23-2.07-15-6.4-22.65-26.95-39.36-51.51-39.98-.47-.01-.95-.02-1.42-.02s-.95.01-1.42.02C48.15 31.78 31 49.4 31 71.01c0 21.61 17.15 39.23 38.58 39.98-24.56-.62-45.11-17.33-51.51-39.98-1.35-4.77-2.07-9.8-2.07-15Z"
          fill={`url(#1a-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>
      <g className="path2">
        <path
          d="M126 85.99c0 29.91-23.86 54.23-53.58 54.98-.47.01-.95.02-1.42.02s-.95-.01-1.42-.02C31.58 140.22 1 109.18 1 70.99 1 32.8 31.58 1.76 69.58 1.01 39.86 1.76 16 26.08 16 55.99c0 5.2.72 10.23 2.07 15 6.4 22.65 26.95 39.36 51.51 39.98.47.01.95.02 1.42.02s.95-.01 1.42-.02C93.85 110.22 111 92.6 111 70.99c0-21.61-17.15-39.23-38.58-39.98 24.56.62 45.11 17.33 51.51 39.98 1.35 4.77 2.07 9.8 2.07 15Z"
          fill={`url(#rock-texture-${id})`}
          filter={`url(#shadow-filter-${id})`}
          stroke="currentColor"
        />
        <path
          d="M126 85.99c0 29.91-23.86 54.23-53.58 54.98-.47.01-.95.02-1.42.02s-.95-.01-1.42-.02C31.58 140.22 1 109.18 1 70.99 1 32.8 31.58 1.76 69.58 1.01 39.86 1.76 16 26.08 16 55.99c0 5.2.72 10.23 2.07 15 6.4 22.65 26.95 39.36 51.51 39.98.47.01.95.02 1.42.02s.95-.01 1.42-.02C93.85 110.22 111 92.6 111 70.99c0-21.61-17.15-39.23-38.58-39.98 24.56.62 45.11 17.33 51.51 39.98 1.35 4.77 2.07 9.8 2.07 15Z"
          fill={`url(#1b-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>
      <defs>
        <pattern height="142" id={`marble-texture-${id}`} patternUnits="userSpaceOnUse" width="142">
          <image height="142" href={marbleTexture} width="142" x="0" y="0" />
        </pattern>
        <pattern height="142" id={`rock-texture-${id}`} patternUnits="userSpaceOnUse" width="142">
          <image height="142" href={rockTexture} width="142" x="0" y="0" />
        </pattern>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`1a-${id}`}
          x1="130.65"
          x2="25.99"
          y1="108.55"
          y2="24.21"
        >
          <stop stopColor="#9EFFE0" />
          <stop offset="1" stopColor="#017953" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`1b-${id}`}
          x1="116.01"
          x2="11.35"
          y1="117.79"
          y2="33.45"
        >
          <stop stopColor="#3D7598" />
          <stop offset="1" stopColor="#BDD6E5" />
        </linearGradient>
        <SvgShadowFilter id={`shadow-filter-${id}`} />
      </defs>
    </svg>
  )
}

// FeaturedPool2SVG.tsx
export function FeaturedPool2SVG() {
  const id = useId()
  const { marbleTexture, rockTexture, blendMode } = usePoolTextures()
  return (
    <svg
      className="featured-pool-svg"
      fill="none"
      height="136"
      overflow="visible"
      viewBox="0 0 142 142"
      width="136"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern height="142" id={`marble-texture-${id}`} patternUnits="userSpaceOnUse" width="142">
          <image height="142" href={marbleTexture} width="142" x="0" y="0" />
        </pattern>
        <pattern height="142" id={`rock-texture-${id}`} patternUnits="userSpaceOnUse" width="142">
          <image height="142" href={rockTexture} width="142" x="0" y="0" />
        </pattern>
        {/* Top */}
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`2a-${id}`}
          x1="17.14"
          x2="107.15"
          y1="26.27"
          y2="98.8"
        >
          <stop stopColor="#9EFFE0" />
          <stop offset="1" stopColor="#017953" />
        </linearGradient>
        {/* Left */}
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`2b-${id}`}
          x1="14.86"
          x2="116.43"
          y1="44.37"
          y2="126.22"
        >
          <stop stopColor="#0050B6" />
          <stop offset="1" stopColor="#85BAFF" />
        </linearGradient>
        {/* Right */}
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`2c-${id}`}
          x1="60"
          x2="130.8"
          y1="116.5"
          y2="108.07"
        >
          <stop stopColor="#1CEF57" />
          <stop offset="1" stopColor="#A9F9C0" />
        </linearGradient>
        <SvgShadowFilter id={`shadow-filter-${id}`} />
      </defs>
      <g className="path3">
        <path
          d="M126 56c0 14.73-5.8 28.12-15.23 37.99-9.71 10.16-23.28 16.61-38.35 16.99C93.85 110.23 111 92.61 111 71c0-6.78-1.69-13.17-4.67-18.76-.22-.42-.45-.84-.69-1.24-.29-.51-.59-1-.89-1.49-.03-.05-.06-.1-.09-.14C96.78 36.72 84.52 28.35 71 25.06c-13.26-3.23-27.74-1.56-40.49 5.8a54.91 54.91 0 0 0-12.3 9.66C2.18 57.3-1.93 83.02 9.45 104.37 4.06 94.45 1 83.08 1 71 1 32.81 31.58 1.77 69.58 1.02c.47-.01.95-.02 1.42-.02s.95.01 1.42.02c24.37.62 44.81 17.09 51.37 39.5A54.952 54.952 0 0 1 126 56Z"
          fill={`url(#rock-texture-${id})`}
          stroke="currentColor"
        />
        <path
          d="M126 56c0 14.73-5.8 28.12-15.23 37.99-9.71 10.16-23.28 16.61-38.35 16.99C93.85 110.23 111 92.61 111 71c0-6.78-1.69-13.17-4.67-18.76-.22-.42-.45-.84-.69-1.24-.29-.51-.59-1-.89-1.49-.03-.05-.06-.1-.09-.14C96.78 36.72 84.52 28.35 71 25.06c-13.26-3.23-27.74-1.56-40.49 5.8a54.91 54.91 0 0 0-12.3 9.66C2.18 57.3-1.93 83.02 9.45 104.37 4.06 94.45 1 83.08 1 71 1 32.81 31.58 1.77 69.58 1.02c.47-.01.95-.02 1.42-.02s.95.01 1.42.02c24.37.62 44.81 17.09 51.37 39.5A54.952 54.952 0 0 1 126 56Z"
          fill={`url(#2a-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>

      <g className="path2">
        <path
          d="M30.51 30.86c12.76-7.36 27.25-9.04 40.52-5.81 13.65 3.33 26.02 11.86 33.89 24.72-11.36-18.18-35.2-24.23-53.91-13.42a39.81 39.81 0 0 0-14.64 14.64c-.3.51-.57 1.01-.85 1.52-.03.05-.06.1-.08.15-7.02 13.15-8.13 27.95-4.22 41.31 3.83 13.1 12.52 24.8 25.27 32.17a54.71 54.71 0 0 0 14.52 5.82c22.55 5.49 46.88-3.81 59.68-24.34-5.9 9.63-14.21 17.96-24.67 24-33.07 19.09-75.24 8.13-94.89-24.4-.24-.4-.49-.81-.73-1.22-.24-.41-.47-.83-.69-1.24-11.67-21.42-7.63-47.36 8.5-64.24a54.81 54.81 0 0 1 12.3-9.65v-.01Z"
          fill={`url(#rock-texture-${id})`}
          filter={`url(#shadow-filter-${id})`}
          stroke="currentColor"
        />
        <path
          d="M30.51 30.86c12.76-7.36 27.25-9.04 40.52-5.81 13.65 3.33 26.02 11.86 33.89 24.72-11.36-18.18-35.2-24.23-53.91-13.42a39.81 39.81 0 0 0-14.64 14.64c-.3.51-.57 1.01-.85 1.52-.03.05-.06.1-.08.15-7.02 13.15-8.13 27.95-4.22 41.31 3.83 13.1 12.52 24.8 25.27 32.17a54.71 54.71 0 0 0 14.52 5.82c22.55 5.49 46.88-3.81 59.68-24.34-5.9 9.63-14.21 17.96-24.67 24-33.07 19.09-75.24 8.13-94.89-24.4-.24-.4-.49-.81-.73-1.22-.24-.41-.47-.83-.69-1.24-11.67-21.42-7.63-47.36 8.5-64.24a54.81 54.81 0 0 1 12.3-9.65v-.01Z"
          fill={`url(#2b-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>

      <g className="path1">
        <path
          d="M56.49 126.13c-12.76-7.36-21.45-19.08-25.29-32.18-3.94-13.49-2.74-28.47 4.46-41.71-10.07 18.93-3.38 42.6 15.33 53.4a39.837 39.837 0 0 0 18.58 5.34c.47.02.95.03 1.42.02.59 0 1.16-.01 1.74-.03h.17c14.9-.5 28.27-6.93 37.88-17C120.21 84.1 126 70.73 126 56c0-5.38-.78-10.58-2.22-15.48C117.27 18.25 97.05 1.83 72.87 1c11.29.29 22.66 3.33 33.12 9.37 33.07 19.09 44.66 61.1 26.31 94.38-.23.41-.46.83-.69 1.24-.23.41-.48.82-.73 1.22-12.72 20.79-37.21 30.26-59.89 24.74a54.881 54.881 0 0 1-14.51-5.83l.01.01Z"
          fill={`url(#rock-texture-${id})`}
          filter={`url(#shadow-filter-${id})`}
          stroke="currentColor"
        />
        <path
          d="M56.49 126.13c-12.76-7.36-21.45-19.08-25.29-32.18-3.94-13.49-2.74-28.47 4.46-41.71-10.07 18.93-3.38 42.6 15.33 53.4a39.837 39.837 0 0 0 18.58 5.34c.47.02.95.03 1.42.02.59 0 1.16-.01 1.74-.03h.17c14.9-.5 28.27-6.93 37.88-17C120.21 84.1 126 70.73 126 56c0-5.38-.78-10.58-2.22-15.48C117.27 18.25 97.05 1.83 72.87 1c11.29.29 22.66 3.33 33.12 9.37 33.07 19.09 44.66 61.1 26.31 94.38-.23.41-.46.83-.69 1.24-.23.41-.48.82-.73 1.22-12.72 20.79-37.21 30.26-59.89 24.74a54.881 54.881 0 0 1-14.51-5.83l.01.01Z"
          fill={`url(#2c-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>
    </svg>
  )
}

// FeaturedPool3SVG.tsx
export function FeaturedPool3SVG() {
  const id = useId()
  const { marbleTexture, rockTexture, blendMode } = usePoolTextures()
  return (
    <svg
      className="featured-pool-svg"
      fill="none"
      height="136"
      overflow="visible"
      viewBox="0 0 142 142"
      width="136"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern height="142" id={`marble-texture-${id}`} patternUnits="userSpaceOnUse" width="142">
          <image height="142" href={marbleTexture} width="142" x="0" y="0" />
        </pattern>
        <pattern height="142" id={`rock-texture-${id}`} patternUnits="userSpaceOnUse" width="142">
          <image height="142" href={rockTexture} width="142" x="0" y="0" />
        </pattern>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`3a-${id}`}
          x1="33.45"
          x2="81"
          y1="130.65"
          y2="19.5"
        >
          <stop stopColor="#85BAFF" />
          <stop offset="1" stopColor="#0050B6" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={`3b-${id}`}
          x1="95.5"
          x2="39"
          y1="-98"
          y2="105"
        >
          <stop stopColor="#F0ECFE" stopOpacity="1" />
          <stop offset="1" stopColor="#A48CFE" stopOpacity="1" />
        </linearGradient>
        <SvgShadowFilter id={`shadow-filter-${id}`} />
      </defs>
      <g className="path1">
        <path
          d="M85.99 16c29.91 0 54.23 23.86 54.98 53.58.01.47.02.95.02 1.42s-.01.95-.02 1.42c-.75 38-31.79 68.58-69.98 68.58-38.19 0-69.23-30.58-69.98-68.58C1.76 102.14 26.08 126 55.99 126c5.2 0 10.23-.72 15-2.07 22.65-6.4 39.36-26.95 39.98-51.51.01-.47.02-.95.02-1.42s-.01-.95-.02-1.42C110.22 48.15 92.6 31 70.99 31c-21.61 0-39.23 17.15-39.98 38.58.62-24.56 17.33-45.11 39.98-51.51 4.77-1.35 9.8-2.07 15-2.07Z"
          fill={`url(#rock-texture-${id})`}
          filter={`url(#shadow-filter-${id})`}
          stroke="currentColor"
        />
        <path
          d="M85.99 16c29.91 0 54.23 23.86 54.98 53.58.01.47.02.95.02 1.42s-.01.95-.02 1.42c-.75 38-31.79 68.58-69.98 68.58-38.19 0-69.23-30.58-69.98-68.58C1.76 102.14 26.08 126 55.99 126c5.2 0 10.23-.72 15-2.07 22.65-6.4 39.36-26.95 39.98-51.51.01-.47.02-.95.02-1.42s-.01-.95-.02-1.42C110.22 48.15 92.6 31 70.99 31c-21.61 0-39.23 17.15-39.98 38.58.62-24.56 17.33-45.11 39.98-51.51 4.77-1.35 9.8-2.07 15-2.07Z"
          fill={`url(#3a-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>
      <g className="path1">
        <path
          d="M56.01 126C26.1 126 1.78 102.14 1.03 72.42c-.01-.47-.02-.95-.02-1.42s.01-.95.02-1.42C1.78 31.58 32.82 1 71.01 1c38.19 0 69.23 30.58 69.98 68.58C140.24 39.86 115.92 16 86.01 16c-5.2 0-10.23.72-15 2.07-22.65 6.4-39.36 26.95-39.98 51.51-.01.47-.02.95-.02 1.42s.01.95.02 1.42C31.78 93.85 49.4 111 71.01 111c21.61 0 39.23-17.15 39.98-38.58-.62 24.56-17.33 45.11-39.98 51.51-4.77 1.35-9.8 2.07-15 2.07Z"
          fill={`url(#rock-texture-${id})`}
          filter={`url(#shadow-filter-${id})`}
          stroke="currentColor"
        />
        <path
          d="M56.01 126C26.1 126 1.78 102.14 1.03 72.42c-.01-.47-.02-.95-.02-1.42s.01-.95.02-1.42C1.78 31.58 32.82 1 71.01 1c38.19 0 69.23 30.58 69.98 68.58C140.24 39.86 115.92 16 86.01 16c-5.2 0-10.23.72-15 2.07-22.65 6.4-39.36 26.95-39.98 51.51-.01.47-.02.95-.02 1.42s.01.95.02 1.42C31.78 93.85 49.4 111 71.01 111c21.61 0 39.23-17.15 39.98-38.58-.62 24.56-17.33 45.11-39.98 51.51-4.77 1.35-9.8 2.07-15 2.07Z"
          fill={`url(#3b-${id})`}
          stroke="currentColor"
          strokeWidth="1"
          style={{ mixBlendMode: blendMode }}
        />
      </g>
    </svg>
  )
}
