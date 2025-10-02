import { Address, parseUnits } from 'viem'
import { useTokenMetadata } from '@repo/lib/modules/tokens/useTokenMetadata'
import { useLbpForm } from './LbpFormProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { getChainId } from '@repo/lib/config/app.config'
import { type InputAmountWithSymbol } from '@repo/lib/modules/pool/actions/create/types'

export function useInitializeLbpInput() {
  const { saleStructureForm, isCollateralNativeAsset } = useLbpForm()
  const {
    selectedChain,
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
  } = saleStructureForm.watch()

  const chainId = getChainId(selectedChain)
  const wethIsEth = isCollateralNativeAsset
  const minBptAmountOut = 0n

  let reserveTokenAddress = collateralTokenAddress
  if (isCollateralNativeAsset) {
    const { tokens } = getNetworkConfig(selectedChain)
    reserveTokenAddress = tokens.addresses.wNativeAsset
  }

  const {
    decimals: reserveTokenDecimals,
    symbol: reserveTokenSymbol,
    isLoading: isLoadingCollateralToken,
  } = useTokenMetadata(reserveTokenAddress, selectedChain)
  const {
    decimals: launchTokenDecimals,
    symbol: launchTokenSymbol,
    isLoading: isLoadingLaunchToken,
  } = useTokenMetadata(launchTokenAddress, selectedChain)

  const isLoading = isLoadingLaunchToken || isLoadingCollateralToken
  const isMissingDecimal = !launchTokenDecimals || !reserveTokenDecimals
  const isMissingSymbol = !launchTokenSymbol || !reserveTokenSymbol

  if (isLoading || isMissingDecimal || isMissingSymbol) {
    return { amountsIn: [], minBptAmountOut, chainId, wethIsEth }
  }

  const launchTokenAmountIn: InputAmountWithSymbol = {
    address: launchTokenAddress as Address,
    decimals: launchTokenDecimals,
    rawAmount: parseUnits(saleTokenAmount, launchTokenDecimals),
    symbol: launchTokenSymbol,
  }

  const reserveTokenAmountIn: InputAmountWithSymbol = {
    address: reserveTokenAddress as Address,
    decimals: reserveTokenDecimals,
    rawAmount: parseUnits(collateralTokenAmount, reserveTokenDecimals),
    symbol: reserveTokenSymbol,
  }

  const amountsIn = [reserveTokenAmountIn, launchTokenAmountIn]

  return { amountsIn, minBptAmountOut, chainId, wethIsEth }
}
