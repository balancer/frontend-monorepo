import React from 'react'
import { useColorMode } from '@chakra-ui/react'

interface PictureProps {
  imgName: string
  altText: string
  defaultImgType: 'png' | 'jpg' | 'webp' | 'avif' | 'svg'
  imgAvif?: boolean
  imgWebp?: boolean
  imgPng?: boolean
  imgPngDark?: boolean
  imgJpg?: boolean
  imgJpgDark?: boolean
  imgSvg?: boolean
  imgSvgPortrait?: boolean
  imgSvgPortraitDark?: boolean
  imgSvgDark?: boolean
  imgAvifPortrait?: boolean
  imgAvifPortraitDark?: boolean
  imgAvifDark?: boolean
  imgAvifMedium?: boolean
  imgAvifLarge?: boolean
  directory?: string
  width?: string | number
  height?: string | number
}

export const Picture: React.FC<PictureProps> = ({
  imgName,
  altText,
  defaultImgType,
  imgAvif = false,
  imgWebp = false,
  imgPng = false,
  imgPngDark = false,
  imgJpg = false,
  imgJpgDark = false,
  imgSvg = false,
  imgSvgDark = false,
  imgSvgPortrait = false,
  imgSvgPortraitDark = false,
  imgAvifPortrait = false,
  imgAvifPortraitDark = false,
  imgAvifDark = false,
  imgAvifMedium = false,
  imgAvifLarge = false,
  directory = '/images/homepage/',
  width,
  height,
}) => {
  const imagePath = `${directory}${imgName}`

  const { colorMode } = useColorMode()

  return (
    <picture className="picture">
      {imgSvgPortraitDark && (
        <source
          srcSet={`${imagePath}-portrait-dark.svg`}
          type="image/svg+xml"
          media={`(orientation: portrait) and ${
            colorMode === 'dark' ? '(prefers-color-scheme: dark)' : 'none'
          }`}
        />
      )}
      {imgSvgPortrait && (
        <source
          srcSet={`${imagePath}-portrait.svg`}
          type="image/svg+xml"
          media="(orientation: portrait)"
        />
      )}
      {imgSvgDark && (
        <source
          srcSet={`${imagePath}.svg`}
          type="image/svg+xml"
          media={colorMode === 'dark' ? '(prefers-color-scheme: dark)' : 'none'}
        />
      )}
      {imgSvg && <source srcSet={`${imagePath}.svg`} type="image/svg+xml" />}

      {imgAvifDark && (
        <source
          srcSet={`${imagePath}-dark.avif`}
          type="image/avif"
          media={colorMode === 'dark' ? 'all' : 'none'}
        />
      )}
      {imgAvifPortraitDark && (
        <source
          srcSet={`${imagePath}-portrait-dark.avif`}
          type="image/avif"
          media={colorMode === 'dark' ? 'all' : 'none'}
        />
      )}
      {imgAvifPortrait && (
        <source
          srcSet={`${imagePath}-portrait.avif`}
          type="image/avif"
          media="(orientation: portrait)"
        />
      )}
      {imgAvifLarge && (
        <source srcSet={`${imagePath}-large.avif`} type="image/avif" media="(min-width: 75em)" />
      )}
      {imgAvifMedium && (
        <source srcSet={`${imagePath}-medium.avif`} type="image/avif" media="(min-width: 40em)" />
      )}
      {imgAvif && <source srcSet={`${imagePath}.avif`} type="image/avif" />}
      {imgWebp && <source srcSet={`${imagePath}.webp`} type="image/webp" />}
      {imgPng && <source srcSet={`${imagePath}.png`} type="image/png" />}
      {imgPngDark && (
        <source
          srcSet={`${imagePath}-dark.png`}
          type="image/png"
          media={colorMode === 'dark' ? 'all' : 'none'}
        />
      )}

      {imgJpgDark && (
        <source
          srcSet={`${imagePath}-dark.jpg`}
          type="image/jpg"
          media={colorMode === 'dark' ? 'all' : 'none'}
        />
      )}
      {imgJpg && <source srcSet={`${imagePath}.jpg`} type="image/jpg" />}
      <img
        src={`${imagePath}.${defaultImgType}`}
        alt={altText}
        loading="lazy"
        decoding="async"
        height={height || '100%'}
        width={width}
        style={{ objectFit: 'cover' }}
      />
    </picture>
  )
}
