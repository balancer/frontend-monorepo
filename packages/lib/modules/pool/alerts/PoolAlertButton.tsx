import { Button, ButtonProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

export function PoolAlertButton({ onClick, children }: PropsWithChildren<ButtonProps>) {
  return (
    <Button h="24px" my="-2" onClick={onClick} py="md" variant="outline">
      {children}
    </Button>
  )
}
