/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box } from '@chakra-ui/react'
import Image from 'next/image'

// @ts-ignore
import graniteSrc from '../images/granite-1.jpg'

export function GraniteBg() {
  return (
    <>
      <Image
        alt="sand"
        fill
        sizes="100%"
        src={graniteSrc}
        style={{ objectFit: 'cover', filter: 'grayscale(100%)' }}
      />
      <Box bg="background.base" h="full" opacity={0.9} position="absolute" w="full" />
    </>
  )
}
