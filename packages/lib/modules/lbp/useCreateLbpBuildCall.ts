import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { CreatePool, PoolType, type CreatePoolLiquidityBootstrappingInput } from '@balancer/sdk'
import { parseUnits } from 'viem'
import { useLbpForm } from './LbpFormProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'

export function useCreateLbpBuildCall({ enabled }: { enabled: boolean }) {
  const { userAddress, isConnected } = useUserAccount()
  const { saleStructureForm } = useLbpForm()
  const {
    launchTokenAddress,
    collateralTokenAddress,
    weightAdjustmentType,
    customStartWeight,
    customEndWeight,
    startTime,
    endTime,
    selectedChain,
  } = saleStructureForm.getValues()

  const chainId = getNetworkConfig(selectedChain).chainId

  const weightConfig = {
    linear_90_10: { start: 90, end: 10 },
    linear_90_50: { start: 90, end: 50 },
    custom: { start: customStartWeight, end: customEndWeight },
  }

  const projectTokenStartWeight = weightConfig[weightAdjustmentType].start
  const reserveTokenStartWeight = 100 - weightConfig[weightAdjustmentType].start
  const projectTokenEndWeight = weightConfig[weightAdjustmentType].end
  const reserveTokenEndWeight = 100 - weightConfig[weightAdjustmentType].end

  const lbpParams = {
    owner: userAddress, // TODO: design?
    blockProjectTokenSwapsIn: true, // TODO: design?
    projectToken: launchTokenAddress as `0x${string}`,
    reserveToken: collateralTokenAddress as `0x${string}`,
    projectTokenStartWeight: parseUnits((projectTokenStartWeight / 100).toString(), 18),
    reserveTokenStartWeight: parseUnits((reserveTokenStartWeight / 100).toString(), 18),
    projectTokenEndWeight: parseUnits((projectTokenEndWeight / 100).toString(), 18),
    reserveTokenEndWeight: parseUnits((reserveTokenEndWeight / 100).toString(), 18),
    startTime: BigInt(Math.floor(new Date(startTime).getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date(endTime).getTime() / 1000)),
  }

  const createLbpInput: CreatePoolLiquidityBootstrappingInput = {
    protocolVersion: 3 as const,
    poolType: PoolType.LiquidityBootstrapping,
    symbol: 'LBP', // TODO: design?
    name: 'Liquidity Bootstrapping Pool', // TODO: design?
    swapFeePercentage: parseUnits('0.01', 18), // TODO: design?
    chainId,
    lbpParams,
  }

  const createPool = new CreatePool()

  const queryFn = async (): Promise<TransactionConfig> => {
    const { callData, to } = createPool.buildCall(createLbpInput)
    return {
      chainId,
      account: userAddress,
      data: callData,
      to,
    }
  }

  return useQuery({
    queryKey: ['create-lbp-build-call'],
    queryFn,
    enabled: enabled && isConnected,
    gcTime: 0,
  })
}
