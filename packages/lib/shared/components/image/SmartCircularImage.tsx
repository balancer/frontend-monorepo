'use client'

import { Box } from '@chakra-ui/react'
import NextImage, { ImageProps } from 'next/image'
import { useState, useEffect } from 'react'

interface SmartCircularImageProps {
  src: string
  alt: string
  size: number
  border?: string
}

export function SmartCircularImage({
  src,
  alt,
  size,
  border,
  ...imageProps
}: SmartCircularImageProps & ImageProps) {
  const [isCircular, setIsCircular] = useState<boolean | null>(null)

  // Function to detect if image is already circular
  const detectImageShape = (imageSrc: string) => {
    return new Promise<boolean>(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          // Create canvas to analyze the image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            resolve(false)
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Check if image has transparent corners (indicating it might be pre-cut circular)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Check corners for transparency
          const checkCorner = (x: number, y: number) => {
            const index = (y * canvas.width + x) * 4
            return data[index + 3] < 128 // Alpha channel < 50%
          }

          const cornerSize = Math.min(canvas.width, canvas.height) * 0.1 // Check 10% of corner
          let transparentCorners = 0

          // Check all four corners
          const corners = [
            [0, 0], // Top-left
            [canvas.width - cornerSize, 0], // Top-right
            [0, canvas.height - cornerSize], // Bottom-left
            [canvas.width - cornerSize, canvas.height - cornerSize], // Bottom-right
          ]

          corners.forEach(([startX, startY]) => {
            let transparentPixels = 0
            let totalPixels = 0

            for (let x = startX; x < startX + cornerSize && x < canvas.width; x++) {
              for (let y = startY; y < startY + cornerSize && y < canvas.height; y++) {
                if (checkCorner(x, y)) {
                  transparentPixels++
                }
                totalPixels++
              }
            }

            // If more than 70% of corner pixels are transparent, consider it a transparent corner
            if (transparentPixels / totalPixels > 0.7) {
              transparentCorners++
            }
          })

          // If 3 or more corners are transparent, likely a circular image
          const hasTransparentCorners = transparentCorners >= 3

          // Additional check: aspect ratio should be close to 1:1 for circular images
          const aspectRatio = img.width / img.height
          const isSquareAspect = aspectRatio > 0.9 && aspectRatio < 1.1

          // Consider it circular only if it has transparent corners AND square aspect ratio
          resolve(hasTransparentCorners && isSquareAspect)
        } catch (error) {
          console.warn('Error analyzing image:', error)
          // Fallback: assume it's not circular if we can't analyze
          resolve(false)
        }
      }

      img.onerror = () => {
        console.warn('Error loading image for analysis:', imageSrc)
        resolve(false)
      }

      img.src = imageSrc
    })
  }

  useEffect(() => {
    detectImageShape(src).then(setIsCircular)
  }, [src])

  const containerProps = {
    borderRadius: 'full',
    boxSize: `${size}px`,
    position: 'relative' as const,
    border,
  }

  if (isCircular) {
    // For circular images: preserve full image
    return (
      <Box {...containerProps} bg="transparent" overflow="visible">
        <NextImage
          alt={alt || 'unknown'}
          fill
          src={src}
          style={{
            objectFit: 'cover',
          }}
          {...imageProps}
        />
      </Box>
    )
  } else {
    // For square images: apply circular mask
    return (
      <Box {...containerProps} overflow="hidden">
        <NextImage
          alt={alt || 'unknown'}
          fill
          src={src}
          style={{
            objectFit: 'contain',
            borderRadius: '50%',
          }}
          {...imageProps}
        />
      </Box>
    )
  }
}
