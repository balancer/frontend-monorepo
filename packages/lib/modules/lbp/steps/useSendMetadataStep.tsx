import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useState } from 'react'
import { VStack, Button } from '@chakra-ui/react'
import { LabelWithIcon } from '@repo/lib/shared/components/btns/button-group/LabelWithIcon'
import { useLbpForm } from '@repo/lib/modules/lbp/LbpFormProvider'
import { useMutation } from '@apollo/client'
import { CreateLbpDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

export function useSendMetadataStep(): TransactionStep {
  const [, setIsStepActivated] = useState(false)
  const [createLbp] = useMutation(CreateLbpDocument)
  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.Address,
    undefined
  )
  const [isComplete, setIsComplete] = useLocalStorage<boolean>(
    LS_KEYS.LbpConfig.IsMetadataSent,
    false
  )
  const { saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()

  const { projectInfoForm } = useLbpForm()
  const { name, description, websiteUrl, tokenIconUrl, telegramHandle, xHandle, discordUrl } =
    projectInfoForm.getValues()

  const handleSendMetadata = async () => {
    const { data } = await createLbp({
      variables: {
        input: {
          poolContract: {
            address: poolAddress as `0x${string}`,
            chain: selectedChain,
          },
          metadata: {
            lbpName: name,
            description,
            website: websiteUrl,
            tokenLogo: tokenIconUrl,
            telegram: telegramHandle,
            discord: discordUrl,
            x: xHandle,
          },
        },
      },
    })
    if (data?.createLBP) setIsComplete(true)
  }

  return {
    id: 'send-lbp-metadata',
    stepType: 'sendLbpMetadata',
    labels: {
      init: 'Send LBP metadata',
      title: 'Send LBP metadata',
      description: 'Send LBP metadata to balancer DB',
      tooltip: 'Send LBP metadata to balancer DB',
      confirmed: 'LBP metadata sent to balancer DB',
      error: 'Error sending LBP metadata to balancer DB',
      preparing: 'Preparing to send LBP metadata to balancer DB',
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
            onClick={handleSendMetadata}
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
