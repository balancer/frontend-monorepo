import { Button, ButtonProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface BeetsSubmitTransactionButtonProps extends ButtonProps {
  children: ReactNode
  onClick?: () => void
  onConfirmed?: () => void
  submittingText?: string
  pendingText?: string
  isPending?: boolean
  isSubmitting?: boolean
  submitError?: Error | null
  inline?: boolean
  fullWidth?: boolean
}

export function BeetsSubmitTransactionButton({
  children,
  onClick,
  submittingText,
  pendingText,
  isPending,
  isSubmitting,
  fullWidth,
  ...rest
}: BeetsSubmitTransactionButtonProps) {
  const isLoading = isPending || isSubmitting

  return (
    <Button
      isLoading={isLoading}
      loadingText={isSubmitting ? submittingText : pendingText}
      onClick={onClick}
      width={fullWidth ? 'full' : undefined}
      {...rest}
    >
      {children}
    </Button>
  )
}
