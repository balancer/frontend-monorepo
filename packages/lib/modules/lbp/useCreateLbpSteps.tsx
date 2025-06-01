import { useCreateLbpStep } from './useCreateLbpStep'
import { useSendMetadataStep } from './useSendMetadataStep'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useLbpForm } from './LbpFormProvider'
import { getSpenderForCreatePool } from '@repo/lib/modules/tokens/token.helpers'
import { Address, parseUnits } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { useMemo } from 'react'

export function useCreateLbpSteps() {
  const createLbpStep = useCreateLbpStep()
  const sendMetadataStep = useSendMetadataStep()

  const { saleStructureForm } = useLbpForm()
  const saleStructure = saleStructureForm.getValues()
  const {
    selectedChain: chain,
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
  } = saleStructure

  const collateralTokenMetadata = useTokenMetadata(collateralTokenAddress, chain)
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)

  const inputAmounts = useMemo(() => {
    if (!collateralTokenMetadata.decimals || !launchTokenMetadata.decimals) {
      return []
    }

    return [
      {
        address: collateralTokenAddress as Address,
        decimals: collateralTokenMetadata.decimals,
        rawAmount: parseUnits(collateralTokenAmount, collateralTokenMetadata.decimals),
        symbol: collateralTokenMetadata.symbol,
      },
      {
        address: launchTokenAddress as Address,
        decimals: launchTokenMetadata.decimals,
        rawAmount: parseUnits(saleTokenAmount, launchTokenMetadata.decimals),
        symbol: launchTokenMetadata.symbol,
      },
    ]
  }, [
    collateralTokenMetadata,
    launchTokenMetadata,
    collateralTokenAmount,
    saleTokenAmount,
    collateralTokenAddress,
    launchTokenAddress,
  ])

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForCreatePool(chain),
      chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      isPermit2: true,
    })

  return {
    isLoadingSteps:
      !collateralTokenMetadata.decimals ||
      !launchTokenMetadata.decimals ||
      isLoadingTokenApprovalSteps,
    steps: inputAmounts.length ? [createLbpStep, sendMetadataStep, ...tokenApprovalSteps] : [],
  }
}
