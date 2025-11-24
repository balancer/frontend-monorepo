import { Button, ButtonProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface BeetsSubmitTransactionButtonProps extends ButtonProps {
  children: ReactNode
  onClick?: () => void
  loadingText?: string
  isLoading?: boolean
  fullWidth?: boolean
}

export function BeetsSubmitTransactionButton({
  children,
  onClick,
  loadingText,
  isLoading,
  fullWidth,
  ...rest
}: BeetsSubmitTransactionButtonProps) {
  return (
    <Button
      isLoading={isLoading}
      loadingText={loadingText}
      onClick={onClick}
      width={fullWidth ? 'full' : undefined}
      {...rest}
    >
      {children}
    </Button>
  )
}
