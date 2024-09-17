'use client'

import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function BalAlertButton({ onClick, children }: PropsWithChildren<ButtonProps>) {
  return (
    <Button
      _focus={{
        borderColor: 'font.dark !important',
      }}
      h="24px"
      mb="-2"
      onClick={onClick}
      py="md"
      variant="outline"
    >
      {children}
    </Button>
  )
}
