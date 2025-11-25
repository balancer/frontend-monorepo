import { useLbpForm } from './LbpFormProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useLbpWeights } from './useLbpWeights'
import { useTokenMetadata } from '../tokens/useTokenMetadata'
import { PoolType } from '@balancer/sdk'
import { parseUnits, zeroAddress } from 'viem'
import { Address } from 'viem'
import { useUserAccount } from '../web3/UserAccountProvider'
import { millisecondsToSeconds } from 'date-fns'
import { PERCENTAGE_DECIMALS } from '../pool/actions/create/constants'
import { UserActions } from '@repo/lib/modules/lbp/lbp.types'
import { useWatch } from 'react-hook-form'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function useCreateLbpInput() {
  const { saleStructureForm, projectInfoForm, isCollateralNativeAsset } = useLbpForm()
  const [
    launchTokenAddress,
    collateralTokenAddress,
    startDateTime,
    endDateTime,
    selectedChain,
    userActions,
    fee,
  ] = useWatch({
    control: saleStructureForm.control,
    name: [
      'launchTokenAddress',
      'collateralTokenAddress',
      'startDateTime',
      'endDateTime',
      'selectedChain',
      'userActions',
      'fee',
    ],
  })
  const [name, owner, poolCreator] = useWatch({
    control: projectInfoForm.control,
    name: ['name', 'owner', 'poolCreator'],
  })
  const { userAddress } = useUserAccount()
  const { tokens, chainId } = getNetworkConfig(selectedChain)

  const chain = selectedChain || PROJECT_CONFIG.defaultNetwork
  let reserveTokenAddress = collateralTokenAddress || ''
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

  const blockProjectTokenSwapsIn = userActions === UserActions.BUY_ONLY

  const { symbol: launchTokenSymbol } = useTokenMetadata(launchTokenAddress || '', chain)
  const { symbol: reserveTokenSymbol } = useTokenMetadata(reserveTokenAddress, chain)

  return {
    protocolVersion: 3 as const,
    poolType: PoolType.LiquidityBootstrapping as const,
    symbol: `${launchTokenSymbol}-${reserveTokenSymbol}-LBP`,
    name: `${name} Liquidity Bootstrapping Pool`,
    swapFeePercentage: parseUnits(`${fee}`, PERCENTAGE_DECIMALS),
    chainId,
    poolCreator: (poolCreator as Address) || zeroAddress,
    lbpParams: {
      owner: (owner as Address) || userAddress,
      blockProjectTokenSwapsIn,
      projectToken: launchTokenAddress as Address,
      reserveToken: reserveTokenAddress as Address,
      projectTokenStartWeight: parseUnits(`${projectTokenStartWeight}`, PERCENTAGE_DECIMALS),
      reserveTokenStartWeight: parseUnits(`${reserveTokenStartWeight}`, PERCENTAGE_DECIMALS),
      projectTokenEndWeight: parseUnits(`${projectTokenEndWeight}`, PERCENTAGE_DECIMALS),
      reserveTokenEndWeight: parseUnits(`${reserveTokenEndWeight}`, PERCENTAGE_DECIMALS),
      startTimestamp: BigInt(millisecondsToSeconds(new Date(startDateTime || '').getTime())),
      endTimestamp: BigInt(millisecondsToSeconds(new Date(endDateTime || '').getTime())),
    },
  }
}
