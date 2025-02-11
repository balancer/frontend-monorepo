/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import {
  Address,
  HumanAmount,
  InputAmount,
  PoolStateWithBalances,
  PoolStateWithUnderlyingBalances,
  calculateProportionalAmounts,
  calculateProportionalAmountsBoosted,
} from '@balancer/sdk'
import { swapWrappedWithNative } from '@repo/lib/modules/tokens/token.helpers'
import { ApiToken, HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useTokenBalances } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { formatUnits } from 'viem'
import { isBoosted } from '../../../pool.helpers'
import { usePool } from '../../../PoolProvider'
import { LiquidityActionHelpers, isEmptyHumanAmount } from '../../LiquidityActionHelpers'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { usePoolStateWithBalancesQuery } from '../queries/usePoolStateWithBalancesQuery'

export function useProportionalInputs() {
  const { isConnected } = useUserAccount()
  const {
    helpers,
    setHumanAmountsIn,
    clearAmountsIn,
    wethIsEth,
    // wrapUnderlying,
    setReferenceAmountAddress,
  } = useAddLiquidity()

  const wrapUnderlying = [false, true] // TODO: uncomment line above
  const { balances, isBalancesLoading } = useTokenBalances()
  const { isLoading: isPoolLoading, pool } = usePool()

  const { data: poolStateWithBalances, isLoading: isPoolStateWithBalancesLoading } =
    usePoolStateWithBalancesQuery(pool)

  function handleProportionalHumanInputChange(token: ApiToken, humanAmount: HumanAmount | '') {
    if (!humanAmount) return

    const tokenAddress = token.address as Address
    if (isEmptyHumanAmount(humanAmount)) {
      return clearAmountsIn({ tokenAddress, humanAmount, symbol: token.symbol })
    }

    setReferenceAmountAddress(tokenAddress)

    const proportionalHumanAmountsIn = _calculateProportionalHumanAmountsIn({
      token,
      humanAmount,
      helpers,
      wethIsEth,
      wrapUnderlying,
      poolStateWithBalances,
    })

    const proportionalHumanAmountsInWithOriginalUserInput = proportionalHumanAmountsIn.map(
      amount => {
        if (isSameAddress(amount.tokenAddress, tokenAddress)) {
          return { ...amount, humanAmount } // We don't want to change the user input with the result of the proportional calculation
        }
        return amount
      }
    )

    setHumanAmountsIn(proportionalHumanAmountsInWithOriginalUserInput)
  }

  /*
    TODO: show warning/tooltip/alert when one of the tokens have zero balance
    (same for unbalanced tab when all tokens have zero balance)
    Old implementation:
    https://github.com/balancer/frontend-monorepo/blob/f68ad17b46f559e2e5556d972a193b3fa6e3706b/packages/lib/modules/pool/actions/add-liquidity/form/TokenInputsWithAddable.tsx#L122
  */
  const hasBalanceForAllTokens =
    isConnected &&
    !isBalancesLoading &&
    !isPoolLoading &&
    !isPoolStateWithBalancesLoading &&
    balances.length > 0

  return {
    hasBalanceForAllTokens,
    handleProportionalHumanInputChange,
  }
}

type Params = {
  token: ApiToken
  humanAmount: HumanAmount
  helpers: LiquidityActionHelpers
  wethIsEth: boolean
  wrapUnderlying: boolean[]
  poolStateWithBalances?: PoolStateWithUnderlyingBalances | PoolStateWithBalances
}
export function _calculateProportionalHumanAmountsIn({
  token,
  humanAmount,
  helpers,
  wethIsEth,
  wrapUnderlying,
  poolStateWithBalances,
}: Params): HumanTokenAmountWithAddress[] {
  const tokenAddress = token.address as Address
  const symbol = token.symbol
  const referenceAmount: InputAmount = helpers.toSdkInputAmounts([
    { tokenAddress, humanAmount, symbol },
  ])[0]

  if (!poolStateWithBalances) {
    throw new Error('Cannot calculate proportional amounts without pool state')
  }

  console.log('calculateProportionalAmountsBoosted input:', {
    poolStateWithBalances,
    referenceAmount,
    // tokenAddress: token.address,
    // tokenSymbol: token.symbol,
    // humanAmount,
    // wrapUnderlying,
  })

  const sdkProportionalAmounts = isBoosted(helpers.pool)
    ? calculateProportionalAmountsBoosted(
        poolStateWithBalances as PoolStateWithUnderlyingBalances,
        referenceAmount,
        wrapUnderlying
      )
    : calculateProportionalAmounts(poolStateWithBalances, referenceAmount)

  const proportionalAmounts = sdkProportionalAmounts.tokenAmounts
    .map(({ address, rawAmount, decimals }) => {
      // Use the humanAmount entered by the user to avoid displaying rounding updates from calculateProportionalAmounts
      if (address === tokenAddress) return { tokenAddress, humanAmount, symbol }

      return {
        tokenAddress: address,
        humanAmount: formatUnits(rawAmount, decimals) as HumanAmount,
        symbol,
      } as HumanTokenAmountWithAddress
    })
    // user updated token must be in the first place of the array because the Proportional handler always calculates bptOut based on the first position
    .sort(sortUpdatedTokenFirst(tokenAddress))

  return wethIsEth
    ? // toSdkInputAmounts swapped native to wrapped so we need to swap back
      swapWrappedWithNative(proportionalAmounts, helpers.pool.chain)
    : proportionalAmounts

  function sortUpdatedTokenFirst(tokenAddress: Address | null) {
    return (a: HumanTokenAmountWithAddress, b: HumanTokenAmountWithAddress) => {
      if (!tokenAddress) return 0
      if (isSameAddress(a.tokenAddress, tokenAddress)) return -1
      if (isSameAddress(b.tokenAddress, tokenAddress)) return 1
      return 0
    }
  }
}

const poolStateWithBalances = {
  id: '0x445a49d1ad280b68026629fe029ed0fbef549a94',
  address: '0x445a49d1ad280b68026629fe029ed0fbef549a94',
  protocolVersion: 3,
  type: 'Weighted',
  tokens: [
    {
      __typename: 'GqlPoolTokenDetail',
      id: '0x445a49d1ad280b68026629fe029ed0fbef549a94-0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
      chain: 'SEPOLIA',
      chainId: 11155111,
      address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
      decimals: 18,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      priority: 0,
      tradable: true,
      isErc4626: false,
      index: 0,
      balance: '0.123158504561713995',
      balanceUSD: '333.0181331647834',
      priceRate: '1',
      weight: '0.5',
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: '0x0000000000000000000000000000000000000000',
      logoURI: null,
      priceRateProviderData: null,
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: null,
      erc4626ReviewData: null,
    },
    {
      __typename: 'GqlPoolTokenDetail',
      id: '0x445a49d1ad280b68026629fe029ed0fbef549a94-0x978206fae13faf5a8d293fb614326b237684b750',
      chain: 'SEPOLIA',
      chainId: 11155111,
      address: '0x978206fae13faf5a8d293fb614326b237684b750',
      decimals: 6,
      name: 'Static Aave Ethereum USDT',
      symbol: 'stataEthUSDT',
      priority: 0,
      tradable: true,
      isErc4626: true,
      index: 1,
      balance: '425.223567',
      balanceUSD: '635.5304412389407',
      priceRate: '1.483127030388079278',
      weight: '0.5',
      hasNestedPool: false,
      isAllowed: true,
      priceRateProvider: '0xb1b171a07463654cc1fe3df4ec05f754e41f0a65',
      logoURI: null,
      priceRateProviderData: {
        __typename: 'GqlPriceRateProviderData',
        address: '0xb1b171a07463654cc1fe3df4ec05f754e41f0a65',
        name: 'waUSDT Rate Provider',
        summary: 'safe',
        reviewed: true,
        warnings: [''],
        upgradeableComponents: [],
        reviewFile: './StatATokenTestnetRateProvider.md',
        factory: null,
      },
      nestedPool: null,
      isBufferAllowed: true,
      underlyingToken: {
        __typename: 'GqlToken',
        chain: 'SEPOLIA',
        chainId: 11155111,
        address: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0',
        decimals: 6,
        name: 'USDT (AAVE Faucet)',
        symbol: 'usdt-aave',
        priority: 0,
        tradable: true,
        isErc4626: false,
        isBufferAllowed: true,
        logoURI: null,
        index: 1,
        balance: '635.54716',
      },
      erc4626ReviewData: {
        __typename: 'Erc4626ReviewData',
        reviewFile: './AaveV3.md',
        summary: 'safe',
        warnings: [''],
      },
    },
  ],
  totalShares: '8.397292659308790883',
}
