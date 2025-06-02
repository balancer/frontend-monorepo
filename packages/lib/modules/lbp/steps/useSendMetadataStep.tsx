import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { VStack, Button } from '@chakra-ui/react'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'
import { useLbpForm } from '@repo/lib/modules/lbp/LbpFormProvider'

export function useSendMetadataStep(): TransactionStep {
  const [, setIsStepActivated] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const { projectInfoForm } = useLbpForm()
  const projectInfo = projectInfoForm.getValues()

  return {
    id: 'send-lbp-metadata',
    stepType: 'sendLbpMetadata',
    labels: {
      init: 'Send LBP metadata',
      title: 'Send LBP metadata',
      description: 'Send LBP metadata to the pool',
      tooltip: 'Send LBP metadata to the pool',
      confirmed: 'LBP metadata sent to the pool',
      error: 'Error sending LBP metadata to the pool',
      preparing: 'Preparing to send LBP metadata to the pool',
    },
    onActivated: () => setIsStepActivated(true),
    onDeactivated: () => setIsStepActivated(false),
    isComplete: () => isComplete,
    renderAction: () => {
      return (
        <VStack width="full">
          <Button
            isDisabled={false}
            isLoading={false}
            loadingText={'loading...'}
            onClick={() => {
              console.log('sending metadata...', projectInfo)
              setIsComplete(true)
            }}
            size="lg"
            variant="primary"
            w="full"
            width="full"
          >
            <LabelWithIcon icon="sign">Send LBP metadata</LabelWithIcon>
          </Button>
        </VStack>
      )
    },
  }
}
