'use client'

import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { HumanAmount, Path } from '@balancer/sdk'
import {
  Card,
  Center,
  HStack,
  VStack,
  Tooltip,
  useDisclosure,
  IconButton,
  Button,
  Box,
  CardHeader,
  CardFooter,
  CardBody,
} from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { useSwap } from './SwapProvider'
import { TokenSelectModal } from '../tokens/TokenSelectModal/TokenSelectModal'
import { Address } from 'viem'
import { SwapPreviewModal } from './modal/SwapModal'
import { TransactionSettings } from '../user/settings/TransactionSettings'
import { PriceImpactAccordion } from '../price-impact/PriceImpactAccordion'
import { ChainSelect } from '../chains/ChainSelect'
import { ArrowDown, CheckCircle, Link, Repeat } from 'react-feather'
import { SwapRate } from './SwapRate'
import { SwapDetails } from './SwapDetails'
import { capitalize } from 'lodash'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'
import { useTokens } from '../tokens/TokensProvider'
import { useIsPoolSwapUrl } from './useIsPoolSwapUrl'
import { CompactTokenSelectModal } from '../tokens/TokenSelectModal/TokenSelectList/CompactTokenSelectModal'
import { PoolSwapCard } from './PoolSwapCard'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { isPoolSwapAllowed, isV3LBP } from '../pool/pool.helpers'
import { supportsNestedActions } from '../pool/actions/LiquidityActionHelpers'
import { ApiToken } from '../tokens/token.types'
import { SwapSimulationError } from './SwapSimulationError'
import { LbpSwapCard } from '@repo/lib/modules/swap/LbpSwapCard'
import { ContractWalletAlert } from '@repo/lib/shared/components/alerts/ContractWalletAlert'
import { useContractWallet } from '../web3/wallets/useContractWallet'
import { useIsSafeAccount } from '../web3/safe.hooks'
import { buildCowSwapUrl } from '../cow/cow.utils'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { RoutesCard } from './RoutesCard'

type Props = {
  redirectToPoolPage?: () => void // Only used for pool swaps
  hasDisabledInputs?: boolean
  nextButtonText?: string
  customToken?: ApiToken
  customTokenUsdPrice?: number
}
export function SwapForm({
  redirectToPoolPage,
  hasDisabledInputs,
  nextButtonText,
  customToken,
  customTokenUsdPrice,
}: Props) {
  const isPoolSwapUrl = useIsPoolSwapUrl()

  const {
    tokenIn,
    tokenOut,
    selectedChain,
    tokens,
    tokenSelectKey,
    isDisabled,
    disabledReason,
    previewModalDisclosure,
    simulationQuery,
    swapAction,
    swapTxHash,
    transactionSteps,
    isPoolSwap,
    pool,
    poolActionableTokens,
    isLbpSwap,
    setSelectedChain,
    setTokenInAmount,
    setTokenOutAmount,
    setTokenSelectKey,
    setTokenIn,
    setTokenOut,
    switchTokens,
    setNeedsToAcceptHighPI,
    resetSwapAmounts,
    replaceUrlPath,
  } = useSwap()

  const [copiedDeepLink, setCopiedDeepLink] = useState(false)
  const tokenSelectDisclosure = useDisclosure()
  const nextBtn = useRef(null)
  const finalRefTokenIn = useRef(null)
  const finalRefTokenOut = useRef(null)
  const isMounted = useIsMounted()
  const { isConnected } = useUserAccount()
  const { startTokenPricePolling } = useTokens()
  const { priceImpact, priceImpactColor, priceImpactLevel } = usePriceImpact()

  const isLoadingSwaps = simulationQuery.isLoading
  const isLoading = isLoadingSwaps || !isMounted
  const loadingText = isLoading ? 'Fetching swap...' : undefined

  function copyDeepLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopiedDeepLink(true)
    setTimeout(() => setCopiedDeepLink(false), 2000)
  }

  function handleTokenSelect(token: ApiToken) {
    if (!token) return
    if (tokenSelectKey === 'tokenIn') {
      setTokenIn(token.address as Address)
    } else if (tokenSelectKey === 'tokenOut') {
      setTokenOut(token.address as Address)
    } else {
      console.error('Unhandled token select key', tokenSelectKey)
    }
  }

  function handleTokenSelectForPoolSwap(token: ApiToken) {
    const tokenAddress = token.address as Address

    if (
      tokens.length === 2 &&
      tokenSelectKey === 'tokenIn' &&
      isSameAddress(tokenAddress, tokenOut.address)
    ) {
      if (tokenOut.address) return switchTokens()
      return setTokenIn(tokenAddress)
    }
    if (
      tokens.length === 2 &&
      tokenSelectKey === 'tokenOut' &&
      isSameAddress(tokenAddress, tokenIn.address)
    ) {
      if (tokenIn.address) return switchTokens()
      return setTokenOut(tokenAddress)
    }

    if (!token) return

    if (
      pool &&
      tokenSelectKey === 'tokenIn' &&
      supportsNestedActions(pool) &&
      !isPoolSwapAllowed(pool, tokenAddress, tokenOut.address)
    ) {
      setTokenIn(tokenAddress)
      setTokenOut('' as Address)
      return
    }

    if (
      pool &&
      tokenSelectKey === 'tokenOut' &&
      supportsNestedActions(pool) &&
      !isPoolSwapAllowed(pool, tokenAddress, tokenIn.address)
    ) {
      setTokenIn('' as Address)
      setTokenOut(tokenAddress)
      return
    }

    handleTokenSelect(token)
  }

  function openTokenSelectModal(tokenSelectKey: 'tokenIn' | 'tokenOut') {
    setTokenSelectKey(tokenSelectKey)
    tokenSelectDisclosure.onOpen()
  }

  function onModalClose() {
    // restart polling for token prices when modal is closed again
    startTokenPricePolling()

    previewModalDisclosure.onClose()

    if (swapTxHash) {
      resetSwapAmounts()
      transactionSteps.resetTransactionSteps()
      if (isPoolSwapUrl || isLbpSwap) return redirectToPoolPage?.()
      replaceUrlPath()
    }
  }

  const disableLbpProjectTokenBuys =
    isLbpSwap && pool && isV3LBP(pool) && pool.isProjectTokenSwapInBlocked

  const isLbpProjectTokenBuy = isLbpSwap && customToken && tokenOut.address === customToken.address

  const iconButtonProps = disableLbpProjectTokenBuys
    ? {
        'aria-label': 'To token',
        icon: <ArrowDown size={16} />,
        _disabled: { opacity: 1 },
        isDisabled: true,
        cursor: 'default',
        _hover: {},
      }
    : {
        'aria-label': 'Switch tokens',
        onClick: switchTokens,
        icon: <Repeat size={16} />,
      }

  const { isContractWallet, isLoading: isLoadingContractWallet } = useContractWallet()
  const isSafeAccount = useIsSafeAccount()

  const cowLink = PROJECT_CONFIG.cowSupportedNetworks.includes(selectedChain)
    ? buildCowSwapUrl({
        chain: selectedChain,
        tokenInAddress: tokenIn.address,
        tokenOutAddress: tokenOut.address,
      })
    : undefined

  return (
    <FadeInOnView>
      <Center h="full" maxW="lg" mx="auto" position="relative" w="full">
        <Card rounded="xl">
          <CardHeader as={HStack} justify="space-between" w="full" zIndex={11}>
            <span>
              {isLbpSwap
                ? `${isLbpProjectTokenBuy ? 'Buy' : 'Sell'} $${customToken?.symbol}`
                : isPoolSwap
                  ? 'Single pool swap'
                  : capitalize(swapAction)}
            </span>
            <HStack>
              {!isLbpSwap && (
                <Tooltip label={copiedDeepLink ? 'Copied!' : 'Copy swap link'}>
                  <Button color="grayText" onClick={copyDeepLink} size="xs" variant="tertiary">
                    {copiedDeepLink ? <CheckCircle size={14} /> : <Link size={14} />}
                  </Button>
                </Tooltip>
              )}

              <TransactionSettings size="xs" />
            </HStack>
          </CardHeader>
          <CardBody align="start" as={VStack}>
            <VStack spacing="md" w="full">
              {isLbpSwap && <LbpSwapCard />}
              {/* an LBP swap is also a pool swap but not the other way around */}
              {isPoolSwap && !isLbpSwap && <PoolSwapCard />}

              <SafeAppAlert />
              {!isLoadingContractWallet && isContractWallet && !isSafeAccount && (
                <ContractWalletAlert />
              )}

              {!isPoolSwap && (
                <ChainSelect
                  onChange={newValue => {
                    setSelectedChain(newValue as GqlChain)
                    setTokenInAmount('')
                  }}
                  value={selectedChain}
                />
              )}
              <VStack w="full">
                <TokenInput
                  address={tokenIn.address}
                  aria-label="TokenIn"
                  chain={selectedChain}
                  isDisabled={hasDisabledInputs}
                  onChange={e => setTokenInAmount(e.currentTarget.value as HumanAmount)}
                  ref={finalRefTokenIn}
                  value={tokenIn.amount}
                  {...(!isLbpSwap && {
                    onToggleTokenClicked: () => openTokenSelectModal('tokenIn'),
                  })}
                  {...(isLbpSwap &&
                    tokenIn.address === customToken?.address && {
                      apiToken: customToken,
                      customUsdPrice: customTokenUsdPrice,
                    })}
                />
                <Box position="relative" zIndex={10}>
                  <IconButton
                    fontSize="2xl"
                    h="8"
                    isRound
                    ml="-4"
                    mt="-4"
                    position="absolute"
                    size="sm"
                    variant="tertiary"
                    w="8"
                    {...iconButtonProps}
                  />
                </Box>
                <TokenInput
                  address={tokenOut.address}
                  aria-label="TokenOut"
                  chain={selectedChain}
                  disableBalanceValidation
                  hasPriceImpact
                  isDisabled={hasDisabledInputs}
                  isLoadingPriceImpact={
                    simulationQuery.isLoading || !simulationQuery.data || !tokenIn.amount
                  }
                  onChange={e => setTokenOutAmount(e.currentTarget.value as HumanAmount)}
                  // pi is only used for token out
                  priceImpactProps={{
                    priceImpact,
                    priceImpactColor,
                    priceImpactLevel,
                  }}
                  ref={finalRefTokenOut}
                  value={tokenOut.amount}
                  {...(!isLbpSwap && {
                    onToggleTokenClicked: () => openTokenSelectModal('tokenOut'),
                  })}
                  {...(isLbpSwap &&
                    tokenOut.address === customToken?.address && {
                      apiToken: customToken,
                      customUsdPrice: customTokenUsdPrice,
                    })}
                />
              </VStack>
              {!simulationQuery.isError && (
                <>
                  <PriceImpactAccordion
                    accordionButtonComponent={
                      <SwapRate customTokenUsdPrice={customTokenUsdPrice} />
                    }
                    accordionPanelComponent={<SwapDetails />}
                    action="swap"
                    cowLink={cowLink}
                    isDisabled={!simulationQuery.data}
                    setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
                  />

                  <RoutesCard
                    chain={selectedChain}
                    paths={
                      simulationQuery.data && 'paths' in simulationQuery.data
                        ? (simulationQuery.data['paths'] as Path[])
                        : []
                    }
                  />
                </>
              )}
              {simulationQuery.isError ? (
                <SwapSimulationError errorMessage={simulationQuery.error?.message} />
              ) : null}
            </VStack>
          </CardBody>
          <CardFooter>
            {isConnected ? (
              <Tooltip label={isDisabled ? disabledReason : ''}>
                <Button
                  isDisabled={isDisabled || !isMounted}
                  isLoading={isLoading}
                  loadingText={loadingText}
                  onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
                  ref={nextBtn}
                  size="lg"
                  variant="secondary"
                  w="full"
                >
                  {nextButtonText || 'Next'}
                </Button>
              </Tooltip>
            ) : (
              <ConnectWallet
                isLoading={isLoading}
                loadingText={loadingText}
                size="lg"
                variant="primary"
                w="full"
              />
            )}
          </CardFooter>
        </Card>
      </Center>
      {isPoolSwap ? (
        <CompactTokenSelectModal
          chain={selectedChain}
          finalFocusRef={tokenSelectKey === 'tokenIn' ? finalRefTokenIn : finalRefTokenOut}
          isOpen={tokenSelectDisclosure.isOpen}
          onClose={tokenSelectDisclosure.onClose}
          onOpen={tokenSelectDisclosure.onOpen}
          onTokenSelect={handleTokenSelectForPoolSwap}
          tokens={poolActionableTokens || []}
        />
      ) : (
        <TokenSelectModal
          chain={selectedChain}
          currentToken={tokenSelectKey === 'tokenIn' ? tokenIn.address : tokenOut.address}
          finalFocusRef={tokenSelectKey === 'tokenIn' ? finalRefTokenIn : finalRefTokenOut}
          isOpen={tokenSelectDisclosure.isOpen}
          onClose={tokenSelectDisclosure.onClose}
          onOpen={tokenSelectDisclosure.onOpen}
          onTokenSelect={handleTokenSelect}
          tokens={tokens}
        />
      )}
      <SwapPreviewModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={previewModalDisclosure.onOpen}
      />
    </FadeInOnView>
  )
}
