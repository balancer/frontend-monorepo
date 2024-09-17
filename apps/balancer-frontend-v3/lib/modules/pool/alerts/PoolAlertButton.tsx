import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function PoolAlertButton({ onClick, children }: PropsWithChildren<ButtonProps>) {
  return (
    <Button onClick={onClick} variant="outline" h="24px" py="md" my="-2">
      {children}
    </Button>
  )
}
