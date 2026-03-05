'use client'

import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function BalAlertButton({
  onClick,
  children,
  isSelected,
}: PropsWithChildren<ButtonProps & { isSelected?: boolean }>) {
  return (
    <Button
      _focus={{
        borderColor: 'font.dark !important',
      }}
      _hover={{
        transform: 'scale(1.05)',
        color: isSelected ? 'white' : 'font.dark',
        borderColor: 'font.dark',
        backgroundColor: isSelected ? 'black' : 'transparent',
      }}
      backgroundColor={isSelected ? 'black' : undefined}
      borderColor="font.dark"
      color={isSelected ? 'white' : 'font.dark'}
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
