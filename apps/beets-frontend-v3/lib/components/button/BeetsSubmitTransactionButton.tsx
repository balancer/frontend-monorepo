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
  onConfirmed,
  submittingText,
  pendingText,
  isPending,
  isSubmitting,
  submitError,
  inline,
  fullWidth,
  ...rest
}: BeetsSubmitTransactionButtonProps) {
  const isLoading = isPending || isSubmitting

  return (
    <Button
      onClick={onClick}
      isLoading={isLoading}
      loadingText={isSubmitting ? submittingText : pendingText}
      width={fullWidth ? 'full' : undefined}
      {...rest}
    >
      {children}
    </Button>
  )
}
