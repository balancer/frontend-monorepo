'use client'
/* eslint-disable react-hooks/exhaustive-deps */

import { getNetworkConfig } from '@/lib/config/app.config'
import { GqlChain, GqlSorSwapType, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useMandatoryContext } from '@/lib/shared/utils/contexts'
import { ApolloClient, useApolloClient, useReactiveVar } from '@apollo/client'
import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react'
import { Address, Hash, isAddress, parseUnits } from 'viem'
import { emptyAddress } from '../web3/contracts/wagmi-helpers'
import { useUserAccount } from '../web3/UserAccountProvider'
import { LABELS } from '@/lib/shared/labels'
import { isDisabledWithReason } from '@/lib/shared/utils/functions/isDisabledWithReason'
import { DefaultSwapHandler } from './handlers/DefaultSwap.handler'
import { bn } from '@/lib/shared/utils/numbers'
import { useSimulateSwapQuery } from './queries/useSimulateSwapQuery'
import { useTokens } from '../tokens/TokensProvider'
import { useDisclosure } from '@chakra-ui/react'
import { useSwapSteps } from './useSwapSteps'
import {
  OSwapAction,
  SdkSimulateSwapResponse,
  SimulateSwapResponse,
  SwapAction,
  SwapState,
} from './swap.types'
import { SwapHandler } from './handlers/Swap.handler'
import { isSameAddress, selectByAddress } from '@/lib/shared/utils/addresses'
import { useVault } from '@/lib/shared/hooks/useVault'
import { NativeWrapHandler } from './handlers/NativeWrap.handler'
import {
  getWrapHandlerClass,
  getWrapType,
  getWrapperForBaseToken,
  isNativeWrap,
  isSupportedWrap,
  isWrapOrUnwrap,
} from './wrap.helpers'
import { useTokenInputsValidation } from '../tokens/TokenInputsValidationProvider'
import { useMakeVarPersisted } from '@/lib/shared/hooks/useMakeVarPersisted'
import { HumanAmount } from '@balancer/sdk'
import { ChainSlug, chainToSlugMap, slugToChainMap } from '../pool/pool.utils'
import { invert } from 'lodash'
import { useTransactionSteps } from '../transactions/transaction-steps/useTransactionSteps'
import { useTokenBalances } from '../tokens/TokenBalancesProvider'
import { useNetworkConfig } from '@/lib/config/useNetworkConfig'
import { usePriceImpact } from '../price-impact/PriceImpactProvider'
import { calcMarketPriceImpact } from '../price-impact/price-impact.utils'
import { isAuraBalSwap } from './swap.helpers'
import { AuraBalSwapHandler } from './handlers/AuraBalSwap.handler'

export type UseSwapResponse = ReturnType<typeof _useSwap>
export const SwapContext = createContext<UseSwapResponse | null>(null)

export type PathParams = {
  chain?: string
  tokenIn?: string
  tokenOut?: string
  amountIn?: string
  amountOut?: string
  // When urlTxHash is present the rest of the params above are not used
  urlTxHash?: Hash
}

function selectSwapHandler(
  tokenInAddress: Address,
  tokenOutAddress: Address,
  chain: GqlChain,
  swapType: GqlSorSwapType,
  apolloClient: ApolloClient<object>,
  tokens: GqlToken[]
): SwapHandler {
  if (isNativeWrap(tokenInAddress, tokenOutAddress, chain)) {
    return new NativeWrapHandler(apolloClient)
  } else if (isSupportedWrap(tokenInAddress, tokenOutAddress, chain)) {
    const WrapHandler = getWrapHandlerClass(tokenInAddress, tokenOutAddress, chain)
    return new WrapHandler()
  } else if (isAuraBalSwap(tokenInAddress, tokenOutAddress, chain, swapType)) {
    return new AuraBalSwapHandler(tokens)
  }

  return new DefaultSwapHandler(apolloClient)
}

export function _useSwap({ urlTxHash, ...pathParams }: PathParams) {
  const swapStateVar = useMakeVarPersisted<SwapState>(
    {
      tokenIn: {
        address: emptyAddress,
        amount: '',
        scaledAmount: BigInt(0),
      },
      tokenOut: {
        address: emptyAddress,
        amount: '',
        scaledAmount: BigInt(0),
      },
      swapType: GqlSorSwapType.ExactIn,
      selectedChain: GqlChain.Mainnet,
    },
    'swapState'
  )

  const swapState = useReactiveVar(swapStateVar)
  const [needsToAcceptHighPI, setNeedsToAcceptHighPI] = useState(false)
  const [tokenSelectKey, setTokenSelectKey] = useState<'tokenIn' | 'tokenOut'>('tokenIn')
  const [initUserChain, setInitUserChain] = useState<GqlChain | undefined>(undefined)

  const { isConnected } = useUserAccount()
  const { chain: walletChain } = useNetworkConfig()
  const { getToken, getTokensByChain, usdValueForToken } = useTokens()
  const { tokens, setTokens } = useTokenBalances()
  const { hasValidationErrors } = useTokenInputsValidation()
  const { setPriceImpact, setPriceImpactLevel } = usePriceImpact()

  const networkConfig = getNetworkConfig(swapState.selectedChain)
  const previewModalDisclosure = useDisclosure()

  const client = useApolloClient()
  const handler = useMemo(
    () =>
      selectSwapHandler(
        swapState.tokenIn.address,
        swapState.tokenOut.address,
        swapState.selectedChain,
        swapState.swapType,
        client,
        tokens
      ),
    [swapState.tokenIn.address, swapState.tokenOut.address, swapState.selectedChain]
  )

  const isTokenInSet = swapState.tokenIn.address !== emptyAddress
  const isTokenOutSet = swapState.tokenOut.address !== emptyAddress

  const tokenInInfo = getToken(swapState.tokenIn.address, swapState.selectedChain)
  const tokenOutInfo = getToken(swapState.tokenOut.address, swapState.selectedChain)

  if ((isTokenInSet && !tokenInInfo) || (isTokenOutSet && !tokenOutInfo)) {
    try {
      setDefaultTokens()
    } catch (error) {
      throw new Error('Token metadata not found')
    }
  }

  const tokenInUsd = usdValueForToken(tokenInInfo, swapState.tokenIn.amount)
  const tokenOutUsd = usdValueForToken(tokenOutInfo, swapState.tokenOut.amount)

  const shouldFetchSwap = (state: SwapState, urlTxHash?: Hash) => {
    if (urlTxHash) return false
    return (
      isAddress(state.tokenIn.address) &&
      isAddress(state.tokenOut.address) &&
      !!state.swapType &&
      bn(getSwapAmount(swapState)).gt(0)
    )
  }

  const getSwapAmount = (state: SwapState) =>
    (state.swapType === GqlSorSwapType.ExactIn ? state.tokenIn.amount : state.tokenOut.amount) ||
    '0'

  const simulationQuery = useSimulateSwapQuery({
    handler,
    swapInputs: {
      chain: swapState.selectedChain,
      tokenIn: swapState.tokenIn.address,
      tokenOut: swapState.tokenOut.address,
      swapType: swapState.swapType,
      swapAmount: getSwapAmount(swapState),
    },
    enabled: shouldFetchSwap(swapState, urlTxHash),
  })

  function handleSimulationResponse({ returnAmount, swapType }: SimulateSwapResponse) {
    swapStateVar({
      ...swapState,
      swapType,
    })

    if (swapType === GqlSorSwapType.ExactIn) {
      setTokenOutAmount(returnAmount, { userTriggered: false })
    } else {
      setTokenInAmount(returnAmount, { userTriggered: false })
    }
  }

  function setSelectedChain(_selectedChain: GqlChain) {
    const defaultTokenState = getDefaultTokenState(_selectedChain)
    swapStateVar(defaultTokenState)
  }

  function setTokenIn(tokenAddress: Address) {
    const isSameAsTokenOut = isSameAddress(tokenAddress, swapState.tokenOut.address)

    swapStateVar({
      ...swapState,
      tokenIn: {
        ...swapState.tokenIn,
        address: tokenAddress,
      },
      tokenOut: isSameAsTokenOut
        ? { ...swapState.tokenOut, address: emptyAddress }
        : swapState.tokenOut,
    })
  }

  function setTokenOut(tokenAddress: Address) {
    const isSameAsTokenIn = isSameAddress(tokenAddress, swapState.tokenIn.address)

    swapStateVar({
      ...swapState,
      tokenOut: {
        ...swapState.tokenOut,
        address: tokenAddress,
      },
      tokenIn: isSameAsTokenIn
        ? { ...swapState.tokenIn, address: emptyAddress }
        : swapState.tokenIn,
    })
  }

  function switchTokens() {
    swapStateVar({
      ...swapState,
      tokenIn: swapState.tokenOut,
      tokenOut: swapState.tokenIn,
      swapType: GqlSorSwapType.ExactIn,
    })
    setTokenInAmount('', { userTriggered: false })
    setTokenOutAmount('', { userTriggered: false })
  }

  function setTokenInAmount(
    amount: string,
    { userTriggered = true }: { userTriggered?: boolean } = {}
  ) {
    const state = swapStateVar()
    const newState = {
      ...state,
      tokenIn: {
        ...state.tokenIn,
        amount,
        scaledAmount: scaleTokenAmount(amount, tokenInInfo),
      },
    }

    if (userTriggered) {
      swapStateVar({
        ...newState,
        swapType: GqlSorSwapType.ExactIn,
      })
      setTokenOutAmount('', { userTriggered: false })
    } else {
      // Sometimes we want to set the amount without triggering a fetch or
      // swapType change, like when we populate the amount after a change from the other input.
      swapStateVar(newState)
    }
  }

  function setTokenOutAmount(
    amount: string,
    { userTriggered = true }: { userTriggered?: boolean } = {}
  ) {
    const state = swapStateVar()
    const newState = {
      ...state,
      tokenOut: {
        ...state.tokenOut,
        amount,
        scaledAmount: scaleTokenAmount(amount, tokenOutInfo),
      },
    }

    if (userTriggered) {
      swapStateVar({
        ...newState,
        swapType: GqlSorSwapType.ExactOut,
      })
      setTokenInAmount('', { userTriggered: false })
    } else {
      // Sometimes we want to set the amount without triggering a fetch or
      // swapType change, like when we populate the amount after a change from
      // the other input.
      swapStateVar(newState)
    }
  }

  function getDefaultTokenState(chain: GqlChain) {
    const {
      tokens: { defaultSwapTokens },
    } = getNetworkConfig(chain)
    const { tokenIn, tokenOut } = defaultSwapTokens || {}

    return {
      swapType: GqlSorSwapType.ExactIn,
      selectedChain: chain,
      tokenIn: {
        ...swapState.tokenIn,
        address: tokenIn ? tokenIn : emptyAddress,
      },
      tokenOut: {
        ...swapState.tokenOut,
        address: tokenOut ? tokenOut : emptyAddress,
      },
    }
  }

  function resetSwapAmounts() {
    const state = swapStateVar()

    swapStateVar({
      ...state,
      tokenIn: {
        ...state.tokenIn,
        amount: '',
        scaledAmount: BigInt(0),
      },
      tokenOut: {
        ...state.tokenOut,
        amount: '',
        scaledAmount: BigInt(0),
      },
    })
  }

  function setDefaultTokens() {
    swapStateVar(getDefaultTokenState(swapState.selectedChain))
  }

  function replaceUrlPath() {
    const { selectedChain, tokenIn, tokenOut, swapType } = swapState
    const { popularTokens } = networkConfig.tokens
    const chainSlug = chainToSlugMap[selectedChain]
    const newPath = ['/swap']

    const _tokenIn = selectByAddress(popularTokens || {}, tokenIn.address) || tokenIn.address
    const _tokenOut = selectByAddress(popularTokens || {}, tokenOut.address) || tokenOut.address

    if (chainSlug) newPath.push(`/${chainSlug}`)
    if (_tokenIn) newPath.push(`/${_tokenIn}`)
    if (_tokenIn && _tokenOut) newPath.push(`/${_tokenOut}`)
    if (_tokenIn && _tokenOut && tokenIn.amount && swapType === GqlSorSwapType.ExactIn) {
      newPath.push(`/${tokenIn.amount}`)
    }
    if (_tokenIn && _tokenOut && tokenOut.amount && swapType === GqlSorSwapType.ExactOut) {
      newPath.push(`/0/${tokenOut.amount}`)
    }

    window.history.replaceState({}, '', newPath.join(''))
  }

  function scaleTokenAmount(amount: string, token: GqlToken | undefined): bigint {
    if (amount === '') return parseUnits('0', 18)
    if (!token) throw new Error('Cant scale amount without token metadata')
    return parseUnits(amount, token.decimals)
  }

  function calcPriceImpact() {
    if (!bn(tokenInUsd).isZero() && !bn(tokenOutUsd).isZero()) {
      setPriceImpact(calcMarketPriceImpact(tokenInUsd, tokenOutUsd))
    } else if (simulationQuery.data) {
      setPriceImpact(undefined)
      setPriceImpactLevel('unknown')
    }
  }

  const wethIsEth =
    isSameAddress(swapState.tokenIn.address, networkConfig.tokens.nativeAsset.address) ||
    isSameAddress(swapState.tokenOut.address, networkConfig.tokens.nativeAsset.address)
  const validAmountOut = bn(swapState.tokenOut.amount).gt(0)

  const protocolVersion = (simulationQuery.data as SdkSimulateSwapResponse)?.protocolVersion || 2
  const { vaultAddress } = useVault(protocolVersion)

  const swapAction: SwapAction = useMemo(() => {
    if (
      isWrapOrUnwrap(swapState.tokenIn.address, swapState.tokenOut.address, swapState.selectedChain)
    ) {
      const wrapType = getWrapType(
        swapState.tokenIn.address,
        swapState.tokenOut.address,
        swapState.selectedChain
      )
      return wrapType ? wrapType : OSwapAction.SWAP
    }

    return OSwapAction.SWAP
  }, [swapState.tokenIn.address, swapState.tokenOut.address, swapState.selectedChain])

  const isWrap = swapAction === 'wrap' || swapAction === 'unwrap'

  /**
   * Step construction
   */
  const { steps, isLoadingSteps } = useSwapSteps({
    vaultAddress,
    swapState,
    handler,
    simulationQuery,
    wethIsEth,
    swapAction,
    tokenInInfo,
    tokenOutInfo,
  })

  const transactionSteps = useTransactionSteps(steps, isLoadingSteps)

  const swapTxHash = urlTxHash || transactionSteps.lastTransaction?.result?.data?.transactionHash
  const swapTxConfirmed = transactionSteps.lastTransactionConfirmed

  const hasQuoteContext = !!simulationQuery.data

  function setInitialTokenIn(slugTokenIn?: string) {
    const { popularTokens } = networkConfig.tokens
    const symbolToAddressMap = invert(popularTokens || {}) as Record<string, Address>
    if (slugTokenIn) {
      if (isAddress(slugTokenIn)) setTokenIn(slugTokenIn as Address)
      else if (symbolToAddressMap[slugTokenIn] && isAddress(symbolToAddressMap[slugTokenIn])) {
        setTokenIn(symbolToAddressMap[slugTokenIn])
      }
    }
  }

  function setInitialTokenOut(slugTokenOut?: string) {
    const { popularTokens } = networkConfig.tokens
    const symbolToAddressMap = invert(popularTokens || {}) as Record<string, Address>
    if (slugTokenOut) {
      if (isAddress(slugTokenOut)) setTokenOut(slugTokenOut as Address)
      else if (symbolToAddressMap[slugTokenOut] && isAddress(symbolToAddressMap[slugTokenOut])) {
        setTokenOut(symbolToAddressMap[slugTokenOut])
      }
    }
  }

  function setInitialChain(slugChain?: string) {
    const _chain =
      slugChain && slugToChainMap[slugChain as ChainSlug]
        ? slugToChainMap[slugChain as ChainSlug]
        : walletChain

    setSelectedChain(_chain)
  }

  function setInitialAmounts(slugAmountIn?: string, slugAmountOut?: string) {
    if (slugAmountIn && !slugAmountOut && bn(slugAmountIn).gt(0)) {
      setTokenInAmount(slugAmountIn as HumanAmount)
    } else if (slugAmountOut && bn(slugAmountOut).gt(0)) {
      setTokenOutAmount(slugAmountOut as HumanAmount)
    } else resetSwapAmounts()
  }

  // Set state on initial load
  useEffect(() => {
    if (urlTxHash) return

    const { chain, tokenIn, tokenOut, amountIn, amountOut } = pathParams

    setInitialChain(chain)
    setInitialTokenIn(tokenIn)
    setInitialTokenOut(tokenOut)
    setInitialAmounts(amountIn, amountOut)

    if (!swapState.tokenIn.address && !swapState.tokenOut.address) setDefaultTokens()
  }, [])

  // When wallet chain changes, update the swap form chain
  useEffect(() => {
    if (isConnected && initUserChain && walletChain !== swapState.selectedChain) {
      setSelectedChain(walletChain)
    } else if (isConnected) {
      setInitUserChain(walletChain)
    }
  }, [walletChain])

  // When a new simulation is triggered, update the state
  useEffect(() => {
    if (simulationQuery.data) {
      handleSimulationResponse(simulationQuery.data)
    }
  }, [simulationQuery.data])

  // Check if tokenIn is a base wrap token and set tokenOut as the wrapped token.
  useEffect(() => {
    const wrapper = getWrapperForBaseToken(swapState.tokenIn.address, swapState.selectedChain)
    if (wrapper) setTokenOut(wrapper.wrappedToken)

    // If the token in address changes we should reset tx step index because
    // the first approval will be different.
    transactionSteps.setCurrentStepIndex(0)
  }, [swapState.tokenIn.address])

  // Check if tokenOut is a base wrap token and set tokenIn as the wrapped token.
  useEffect(() => {
    const wrapper = getWrapperForBaseToken(swapState.tokenOut.address, swapState.selectedChain)
    if (wrapper) setTokenIn(wrapper.wrappedToken)
  }, [swapState.tokenOut.address])

  // Update the URL path when the tokens change
  useEffect(() => {
    if (!swapTxHash) replaceUrlPath()
  }, [swapState.selectedChain, swapState.tokenIn, swapState.tokenOut, swapState.tokenIn.amount])

  // Update selecteable tokens when the chain changes
  useEffect(() => {
    setTokens(getTokensByChain(swapState.selectedChain))
  }, [swapState.selectedChain])

  // Open the preview modal when a swap tx hash is present
  useEffect(() => {
    if (swapTxHash) {
      previewModalDisclosure.onOpen()
    }
  }, [swapTxHash])

  // If token out value changes when swapping exact in, recalculate price impact.
  useEffect(() => {
    if (swapState.swapType === GqlSorSwapType.ExactIn) {
      calcPriceImpact()
    }
  }, [tokenOutUsd])

  // If token in value changes when swapping exact out, recalculate price impact.
  useEffect(() => {
    if (swapState.swapType === GqlSorSwapType.ExactOut) {
      calcPriceImpact()
    }
  }, [tokenInUsd])

  const { isDisabled, disabledReason } = isDisabledWithReason(
    [!isConnected, LABELS.walletNotConnected],
    [!validAmountOut, 'Invalid amount out'],
    [needsToAcceptHighPI, 'Accept high price impact first'],
    [hasValidationErrors, 'Invalid input'],
    [simulationQuery.isError, 'Error fetching swap'],
    [simulationQuery.isLoading, 'Fetching swap...']
  )

  return {
    ...swapState,
    transactionSteps,
    tokens,
    tokenInInfo,
    tokenOutInfo,
    tokenSelectKey,
    simulationQuery,
    isDisabled,
    disabledReason,
    previewModalDisclosure,
    handler,
    wethIsEth,
    swapAction,
    urlTxHash,
    swapTxHash,
    hasQuoteContext,
    isWrap,
    swapTxConfirmed,
    replaceUrlPath,
    resetSwapAmounts,
    setTokenSelectKey,
    setSelectedChain,
    setTokenInAmount,
    setTokenOutAmount,
    setTokenIn,
    setTokenOut,
    switchTokens,
    setNeedsToAcceptHighPI,
  }
}

type Props = PropsWithChildren<{
  pathParams: PathParams
}>

export function SwapProvider({ pathParams, children }: Props) {
  const hook = _useSwap(pathParams)
  return <SwapContext.Provider value={hook}>{children}</SwapContext.Provider>
}

export const useSwap = (): UseSwapResponse => useMandatoryContext(SwapContext, 'Swap')
