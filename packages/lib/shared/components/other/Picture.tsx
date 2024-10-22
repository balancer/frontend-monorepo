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
          media={`(orientation: portrait) and ${
            colorMode === 'dark' ? '(prefers-color-scheme: dark)' : 'none'
          }`}
          srcSet={`${imagePath}-portrait-dark.svg`}
          type="image/svg+xml"
        />
      )}
      {imgSvgPortrait && (
        <source
          media="(orientation: portrait)"
          srcSet={`${imagePath}-portrait.svg`}
          type="image/svg+xml"
        />
      )}
      {imgSvgDark && (
        <source
          media={colorMode === 'dark' ? '(prefers-color-scheme: dark)' : 'none'}
          srcSet={`${imagePath}.svg`}
          type="image/svg+xml"
        />
      )}
      {imgSvg && <source srcSet={`${imagePath}.svg`} type="image/svg+xml" />}

      {imgAvifDark && (
        <source
          media={colorMode === 'dark' ? 'all' : 'none'}
          srcSet={`${imagePath}-dark.avif`}
          type="image/avif"
        />
      )}
      {imgAvifPortraitDark && (
        <source
          media={colorMode === 'dark' ? 'all' : 'none'}
          srcSet={`${imagePath}-portrait-dark.avif`}
          type="image/avif"
        />
      )}
      {imgAvifPortrait && (
        <source
          media="(orientation: portrait)"
          srcSet={`${imagePath}-portrait.avif`}
          type="image/avif"
        />
      )}
      {imgAvifLarge && (
        <source media="(min-width: 75em)" srcSet={`${imagePath}-large.avif`} type="image/avif" />
      )}
      {imgAvifMedium && (
        <source media="(min-width: 40em)" srcSet={`${imagePath}-medium.avif`} type="image/avif" />
      )}
      {imgAvif && <source srcSet={`${imagePath}.avif`} type="image/avif" />}
      {imgWebp && <source srcSet={`${imagePath}.webp`} type="image/webp" />}
      {imgPng && <source srcSet={`${imagePath}.png`} type="image/png" />}
      {imgPngDark && (
        <source
          media={colorMode === 'dark' ? 'all' : 'none'}
          srcSet={`${imagePath}-dark.png`}
          type="image/png"
        />
      )}

      {imgJpgDark && (
        <source
          media={colorMode === 'dark' ? 'all' : 'none'}
          srcSet={`${imagePath}-dark.jpg`}
          type="image/jpg"
        />
      )}
      {imgJpg && <source srcSet={`${imagePath}.jpg`} type="image/jpg" />}
      <img
        alt={altText}
        decoding="async"
        height={height || '100%'}
        loading="lazy"
        src={`${imagePath}.${defaultImgType}`}
        style={{ objectFit: 'cover' }}
        width={width}
      />
    </picture>
  )
}
