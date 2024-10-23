'use client'
import { Container } from '@chakra-ui/react'
import { ReactNode } from 'react'

export default function Noise({ children }: { children: ReactNode | ReactNode[] }) {
  return (
    <Container
      backgroundImage={`url('/images/background-noise.png')`}
      height="full"
      maxWidth="full"
      p="0"
      width="full"
    >
      <Container
        backgroundColor="background.baseWithOpacity"
        height="full"
        maxWidth="full"
        p="0"
        width="full"
      >
        {children}
      </Container>
    </Container>
  )
}
