'use client'
import { Container, ContainerProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

export default function Noise({
  backgroundColor = 'background.baseWithOpacity',
  children,
  ...rest
}: {
  backgroundColor?: string
  children: ReactNode | ReactNode[]
} & ContainerProps) {
  return (
    <Container
      backgroundImage={`url('/images/background-noise.png')`}
      height="full"
      maxWidth="full"
      p="0"
      width="full"
    >
      <Container
        backgroundColor={backgroundColor}
        height="full"
        maxWidth="full"
        p="0"
        width="full"
        {...rest}
      >
        {children}
      </Container>
    </Container>
  )
}
