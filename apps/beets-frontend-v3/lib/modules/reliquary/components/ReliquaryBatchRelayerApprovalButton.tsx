import { Button } from '@chakra-ui/react'

interface Props {
  onConfirmed?: () => void
}

export function ReliquaryBatchRelayerApprovalButton({ onConfirmed }: Props) {
  return (
    <Button
      onClick={() => {
        console.log('Approve batch relayer - not implemented')
        onConfirmed?.()
      }}
      variant="primary"
      w="full"
    >
      Approve Batch Relayer
    </Button>
  )
}
