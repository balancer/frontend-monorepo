'use client'

import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function BalAlertButton({ onClick, children }: PropsWithChildren<ButtonProps>) {
  return (
    <Button
      onClick={onClick}
      h="24px"
      py="md"
      mb="-2"
      variant="outline"
      _focus={{
        borderColor: 'font.dark !important',
      }}
    >
      {children}
    </Button>
  )
}
