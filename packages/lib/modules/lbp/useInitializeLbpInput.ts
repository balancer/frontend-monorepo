import { Address, parseUnits } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { useLbpForm } from './LbpFormProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { getChainId } from '@repo/lib/config/app.config'
import { type InputAmountWithSymbol } from '@repo/lib/modules/pool/actions/create/types'
import { useWatch } from 'react-hook-form'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function useInitializeLbpInput() {
  const { saleStructureForm, isCollateralNativeAsset } = useLbpForm()
  const {
    selectedChain,
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
  } = useWatch({ control: saleStructureForm.control })

  const chain = selectedChain || PROJECT_CONFIG.defaultNetwork
  const chainId = getChainId(chain)
  const wethIsEth = isCollateralNativeAsset
  const minBptAmountOut = 0n

  let reserveTokenAddress = collateralTokenAddress || ''
  if (isCollateralNativeAsset) {
    const { tokens } = getNetworkConfig(selectedChain)
    reserveTokenAddress = tokens.addresses.wNativeAsset
  }

  const {
    decimals: reserveTokenDecimals,
    symbol: reserveTokenSymbol,
    isLoading: isLoadingCollateralToken,
  } = useTokenMetadata(reserveTokenAddress, chain)
  const {
    decimals: launchTokenDecimals,
    symbol: launchTokenSymbol,
    isLoading: isLoadingLaunchToken,
  } = useTokenMetadata(launchTokenAddress || '', chain)

  const isLoading = isLoadingLaunchToken || isLoadingCollateralToken
  const isMissingDecimal = !launchTokenDecimals || !reserveTokenDecimals
  const isMissingSymbol = !launchTokenSymbol || !reserveTokenSymbol

  if (isLoading || isMissingDecimal || isMissingSymbol) {
    return { amountsIn: [], minBptAmountOut, chainId, wethIsEth }
  }

  const launchTokenAmountIn: InputAmountWithSymbol = {
    address: launchTokenAddress as Address,
    decimals: launchTokenDecimals,
    rawAmount: parseUnits(saleTokenAmount || '0', launchTokenDecimals),
    symbol: launchTokenSymbol,
  }

  const reserveTokenAmountIn: InputAmountWithSymbol = {
    address: reserveTokenAddress as Address,
    decimals: reserveTokenDecimals,
    rawAmount: parseUnits(collateralTokenAmount || '0', reserveTokenDecimals),
    symbol: reserveTokenSymbol,
  }

  const amountsIn = [reserveTokenAmountIn, launchTokenAmountIn]

  return { amountsIn, minBptAmountOut, chainId, wethIsEth }
}
