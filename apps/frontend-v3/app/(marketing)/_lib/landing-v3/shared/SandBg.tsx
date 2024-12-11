/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box } from '@chakra-ui/react'
import Image from 'next/image'

// @ts-ignore
import sand1Src from '../images/sand-1.jpg'
// @ts-ignore
import sand2Src from '../images/sand-2.jpg'
// @ts-ignore
import sand3Src from '../images/sand-3.jpg'

export function SandBg({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  const src = variant === 1 ? sand1Src : variant === 2 ? sand2Src : sand3Src

  return (
    <>
      <Image alt="sand" fill src={src} style={{ objectFit: 'cover', filter: 'grayscale(100%)' }} />
      <Box bg="background.base" h="full" opacity={0.9} position="absolute" w="full" />
    </>
  )
}
