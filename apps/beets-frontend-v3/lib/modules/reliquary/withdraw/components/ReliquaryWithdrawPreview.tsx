import { Alert, AlertIcon, Box, StackDivider, VStack } from '@chakra-ui/react'
import { numberFormatUSDValue } from '~/lib/util/number-formats'
import { BeetsBox } from '~/components/box/BeetsBox'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useReliquaryWithdrawState } from '~/modules/reliquary/withdraw/lib/useReliquaryWithdrawState'
import { ReliquaryWithdrawSummary } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawSummary'
import { FadeInBox } from '~/components/animation/FadeInBox'
import { sum } from 'lodash'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import useReliquary from '~/modules/reliquary/lib/useReliquary'
import { useReliquaryWithdrawAndHarvestContractCallData } from '~/modules/reliquary/lib/useReliquaryWithdrawAndHarvestContractCallData'
import { useReliquaryZap } from '~/modules/reliquary/lib/useReliquaryZap'
import { oldBnumToHumanReadable, oldBnumScaleAmount } from '~/lib/services/pool/lib/old-big-number'
import { useEffect, useState } from 'react'
import { useBatchRelayerHasApprovedForAll } from '../../lib/useBatchRelayerHasApprovedForAll'
import { transactionMessageFromError } from '~/lib/util/transaction-util'
import { SubTransactionSubmittedContent } from '~/components/transaction/SubTransactionSubmittedContent'
import TokenRow from '~/components/token/TokenRow'
import { CurrentStepProvider } from '../../lib/useReliquaryCurrentStep'
import {
  ReliquaryTransactionStepsSubmit,
  TransactionStep,
} from '../../components/ReliquaryTransactionStepsSubmit'
import { useHasBatchRelayerApproval } from '~/lib/util/useHasBatchRelayerApproval'

interface Props {
  onWithdrawComplete(): void
  onClose(): void
}

export function ReliquaryWithdrawPreview({ onWithdrawComplete, onClose }: Props) {
  const { pool } = usePool()
  const { selectedWithdrawType, singleAssetWithdraw, proportionalAmounts, proportionalPercent } =
    useReliquaryWithdrawState()
  const { priceForAmount } = useGetTokens()
  const [steps, setSteps] = useState<TransactionStep[] | null>(null)

  const { selectedRelic, refetchRelicPositions } = useReliquary()
  const { data: reliquaryContractCalls, isLoading: isLoadingReliquaryContractCallData } =
    useReliquaryWithdrawAndHarvestContractCallData({
      relicId: parseInt(selectedRelic?.relicId || ''),
      bptAmount: oldBnumToHumanReadable(
        oldBnumScaleAmount(selectedRelic?.amount || '').times(proportionalPercent / 100)
      ),
      poolTotalShares: pool.dynamicData.totalShares,
      poolTokens: pool.tokens,
    })
  const { data: batchRelayerHasApprovedForAll, isLoading: isLoadingBatchRelayerHasApprovedForAll } =
    useBatchRelayerHasApprovedForAll()
  const { reliquaryZap, ...reliquaryZapQuery } = useReliquaryZap('WITHDRAW')
  const { data: hasBatchRelayerApproval, isLoading: isLoadingHasBatchRelayerApproval } =
    useHasBatchRelayerApproval()

  console.log({ hasBatchRelayerApproval })

  const withdrawAmounts =
    selectedWithdrawType === 'SINGLE_ASSET' && singleAssetWithdraw
      ? [singleAssetWithdraw]
      : proportionalAmounts
        ? proportionalAmounts
        : []

  const totalWithdrawValue = sum(withdrawAmounts.map(priceForAmount))

  const isLoading =
    isLoadingHasBatchRelayerApproval ||
    isLoadingBatchRelayerHasApprovedForAll ||
    isLoadingReliquaryContractCallData

  useEffect(() => {
    if (isLoading) {
      return
    }

    const steps: TransactionStep[] = [
      { id: 'exit', tooltipText: '', type: 'other', buttonText: 'Withdraw' },
    ]

    if (!batchRelayerHasApprovedForAll) {
      steps.unshift({
        id: 'batch-relayer-reliquary',
        type: 'other',
        buttonText: 'Approve Batch Relayer for all relics',
        tooltipText: 'This relic requires you to approve the batch relayer.',
      })
    }

    if (!hasBatchRelayerApproval) {
      steps.unshift({
        id: 'batch-relayer',
        type: 'other',
        buttonText: 'Approve Batch Relayer',
        tooltipText: 'This pool requires you to approve the batch relayer to withdraw.',
      })
    }

    setSteps(steps)
  }, [hasBatchRelayerApproval, batchRelayerHasApprovedForAll, isLoading])

  return (
    <CurrentStepProvider>
      <VStack spacing="4" width="full">
        <Box px="4" width="full">
          <BeetsBox width="full" mb="4">
            <VStack
              width="full"
              divider={<StackDivider borderColor="whiteAlpha.200" />}
              mt="4"
              p="2"
            >
              {withdrawAmounts.map((token, index) => {
                return (
                  <TokenRow key={token.address} address={token.address} amount={token.amount} />
                )
              })}
            </VStack>
          </BeetsBox>
          <ReliquaryWithdrawSummary totalWithdrawValue={totalWithdrawValue} width="full" mb="4" />
          <VStack width="full" spacing="4">
            {reliquaryZapQuery.error && (
              <Box width="full">
                <Alert width="full" status="error">
                  <AlertIcon />
                  {transactionMessageFromError(reliquaryZapQuery.error)}
                </Alert>
              </Box>
            )}
            {reliquaryZapQuery.isConfirmed && (
              <Box width="full">
                <FadeInBox isVisible={reliquaryZapQuery.isConfirmed}>
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    {`You've successfully withdrawn ${numberFormatUSDValue(
                      totalWithdrawValue
                    )} from the relic.`}
                  </Alert>
                </FadeInBox>
              </Box>
            )}
            <Box
              width="full"
              pb={
                reliquaryZapQuery.isConfirmed ||
                reliquaryZapQuery.isFailed ||
                reliquaryZapQuery.isPending
                  ? '0'
                  : '4'
              }
            >
              <ReliquaryTransactionStepsSubmit
                isLoading={isLoadingReliquaryContractCallData}
                loadingButtonText=""
                completeButtonText="Return to maBEETS"
                onCompleteButtonClick={onClose}
                onSubmit={() => {
                  if (reliquaryContractCalls) {
                    reliquaryZap(reliquaryContractCalls)
                  }
                }}
                onConfirmed={async id => {
                  if (id === 'exit') {
                    onWithdrawComplete()
                    refetchRelicPositions()
                  }
                }}
                steps={steps || []}
                queries={[{ ...reliquaryZapQuery, id: 'exit' }]}
              />
            </Box>
          </VStack>
        </Box>
        <FadeInBox
          width="full"
          isVisible={
            reliquaryZapQuery.isConfirmed ||
            reliquaryZapQuery.isPending ||
            reliquaryZapQuery.isFailed
          }
        >
          <SubTransactionSubmittedContent query={reliquaryZapQuery} />
        </FadeInBox>
      </VStack>
    </CurrentStepProvider>
  )
}
