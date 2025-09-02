'use client'

import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function BalAlertButton({ onClick, children }: PropsWithChildren<ButtonProps>) {
  return (
    <Button
      _focus={{
        borderColor: 'font.dark !important',
      }}
      _hover={{
        transform: 'scale(1.05)',
        color: 'font.dark',
        borderColor: 'font.dark',
        backgroundColor: 'transparent',
      }}
      borderColor="font.dark"
      color="font.dark"
      fontSize="sm"
      h="24px"
      mb="-2"
      onClick={onClick}
      px="md"
      py="md"
      variant="outline"
    >
      {children}
    </Button>
  )
}
