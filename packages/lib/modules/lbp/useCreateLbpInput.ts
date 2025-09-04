import { useLbpForm } from './LbpFormProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useLbpWeights } from './useLbpWeights'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { PoolType } from '@balancer/sdk'
import { parseUnits } from 'viem'
import { Address } from 'viem'
import { useUserAccount } from '../web3/UserAccountProvider'

export function useCreateLbpInput() {
  const { saleStructureForm, projectInfoForm, isCollateralNativeAsset } = useLbpForm()
  const {
    launchTokenAddress,
    collateralTokenAddress,
    startDateTime,
    endDateTime,
    selectedChain,
    userActions,
    fee,
  } = saleStructureForm.watch()
  const { name, owner } = projectInfoForm.watch()
  const { userAddress } = useUserAccount()
  const { tokens, chainId } = getNetworkConfig(selectedChain)

  let reserveTokenAddress = collateralTokenAddress
  if (isCollateralNativeAsset) {
    // pool must be created with wrapped native asset
    reserveTokenAddress = tokens.addresses.wNativeAsset
  }

  const {
    projectTokenStartWeight,
    reserveTokenStartWeight,
    projectTokenEndWeight,
    reserveTokenEndWeight,
  } = useLbpWeights()

  const blockProjectTokenSwapsIn = userActions === 'buy_only' ? true : false

  const { symbol: launchTokenSymbol } = useTokenMetadata(launchTokenAddress, selectedChain)
  const { symbol: reserveTokenSymbol } = useTokenMetadata(reserveTokenAddress, selectedChain)

  return {
    protocolVersion: 3 as const,
    poolType: PoolType.LiquidityBootstrapping as const,
    symbol: `${launchTokenSymbol}-${reserveTokenSymbol}-LBP`,
    name: `${name} Liquidity Bootstrapping Pool`,
    swapFeePercentage: parseUnits((fee / 100).toString(), 18),
    chainId,
    lbpParams: {
      owner: (owner as Address) || userAddress,
      blockProjectTokenSwapsIn,
      projectToken: launchTokenAddress as Address,
      reserveToken: reserveTokenAddress as Address,
      projectTokenStartWeight: parseUnits(`${projectTokenStartWeight / 100}`, 18),
      reserveTokenStartWeight: parseUnits(`${reserveTokenStartWeight / 100}`, 18),
      projectTokenEndWeight: parseUnits(`${projectTokenEndWeight / 100}`, 18),
      reserveTokenEndWeight: parseUnits(`${reserveTokenEndWeight / 100}`, 18),
      startTime: BigInt(Math.floor(new Date(startDateTime).getTime() / 1000)),
      endTime: BigInt(Math.floor(new Date(endDateTime).getTime() / 1000)),
    },
  }
}
