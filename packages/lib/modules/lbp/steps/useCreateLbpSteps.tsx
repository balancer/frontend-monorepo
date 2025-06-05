import { useCreateLbpStep } from './useCreateLbpStep'
import { useSendMetadataStep } from './useSendMetadataStep'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { useLbpForm } from '../LbpFormProvider'
import { getSpenderForCreatePool } from '@repo/lib/modules/tokens/token.helpers'
import { Address, parseUnits } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { useMemo } from 'react'
import { useInitializeLbpStep } from './useInitializeLbpStep'
import { useSignPermit2InitializeStep } from '@repo/lib/modules/pool/actions/initialize/useSignPermit2InitializeStep'
import { getNetworkConfig } from '@repo/lib/config/app.config'

export function useCreateLbpSteps() {
  const createLbpStep = useCreateLbpStep()
  const sendMetadataStep = useSendMetadataStep()
  const { saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const chainId = getNetworkConfig(selectedChain).chainId

  const initAmounts = useLbpInitAmounts()

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForCreatePool(selectedChain),
      chain: selectedChain,
      approvalAmounts: initAmounts,
      actionType: 'AddLiquidity',
      isPermit2: true,
    })

  const initPoolInput = {
    minBptAmountOut: 0n,
    chainId,
    amountsIn: initAmounts,
    wethIsEth: undefined, // TODO
  }

  const signPermit2Step = useSignPermit2InitializeStep({ initPoolInput, chain: selectedChain })
  const initLbpStep = useInitializeLbpStep({ initPoolInput })

  const isSignPermit2Loading = !signPermit2Step
  const isLoadingSteps = !initAmounts.length || isLoadingTokenApprovalSteps || isSignPermit2Loading

  return {
    isLoadingSteps,
    steps: [
      createLbpStep,
      sendMetadataStep,
      ...tokenApprovalSteps,
      ...(signPermit2Step ? [signPermit2Step] : []),
      initLbpStep,
    ],
  }
}

export function useLbpInitAmounts() {
  const { saleStructureForm } = useLbpForm()
  const {
    selectedChain: chain,
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
  } = saleStructureForm.watch()

  const collateralTokenMetadata = useTokenMetadata(collateralTokenAddress, chain)
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, chain)

  return useMemo(() => {
    if (!collateralTokenMetadata.decimals || !launchTokenMetadata.decimals) return []

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
}
