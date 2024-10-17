'use client'

import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { GqlChain, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { HumanAmount } from '@balancer/sdk'
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
import { CheckCircle, Link, Repeat } from 'react-feather'
import { SwapRate } from './SwapRate'
import { SwapDetails } from './SwapDetails'
import { capitalize } from 'lodash'
import { motion, easeOut } from 'framer-motion'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { ErrorAlert } from '@repo/lib/shared/components/errors/ErrorAlert'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { parseSwapError } from './swap.helpers'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'
import { useTokens } from '../tokens/TokensProvider'
import { useIsPoolSwapUrl } from './useIsPoolSwapUrl'
import { CompactTokenSelectModal } from '../tokens/TokenSelectModal/TokenSelectList/CompactTokenSelectModal'
import { PoolSwapCard } from './PoolSwapCard'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type Props = {
  redirectToPoolPage?: () => void // Only used for pool swaps
}
export function SwapForm({ redirectToPoolPage }: Props) {
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

  const isLoadingSwaps = simulationQuery.isLoading
  const isLoading = isLoadingSwaps || !isMounted
  const loadingText = isLoading ? 'Fetching swap...' : undefined

  function copyDeepLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopiedDeepLink(true)
    setTimeout(() => setCopiedDeepLink(false), 2000)
  }

  function handleTokenSelect(token: GqlToken) {
    if (!token) return
    if (tokenSelectKey === 'tokenIn') {
      setTokenIn(token.address as Address)
    } else if (tokenSelectKey === 'tokenOut') {
      setTokenOut(token.address as Address)
    } else {
      console.error('Unhandled token select key', tokenSelectKey)
    }
  }

  function handleTokenSelectForPoolSwap(token: GqlToken) {
    if (
      tokens.length === 2 &&
      tokenSelectKey === 'tokenIn' &&
      isSameAddress(token.address, tokenOut.address)
    )
      return switchTokens()
    if (
      tokens.length === 2 &&
      tokenSelectKey === 'tokenOut' &&
      isSameAddress(token.address, tokenIn.address)
    )
      return switchTokens()
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
      if (isPoolSwapUrl) return redirectToPoolPage?.()
      replaceUrlPath()
    }
  }

  return (
    <FadeInOnView>
      <Center
        h="full"
        w={['100vw', 'full']}
        maxW="lg"
        mx="auto"
        position="relative"
        left={['-12px', '0']}
      >
        <Card rounded="xl">
          <CardHeader as={HStack} w="full" justify="space-between" zIndex={11}>
            <span>{isPoolSwap ? 'Single pool swap' : capitalize(swapAction)}</span>
            <HStack>
              <Tooltip label={copiedDeepLink ? 'Copied!' : 'Copy swap link'}>
                <Button variant="tertiary" size="sm" color="grayText" onClick={copyDeepLink}>
                  {copiedDeepLink ? <CheckCircle size={16} /> : <Link size={16} />}
                </Button>
              </Tooltip>

              <TransactionSettings size="sm" />
            </HStack>
          </CardHeader>
          <CardBody as={VStack} align="start">
            <VStack spacing="md" w="full">
              {isPoolSwap && <PoolSwapCard />}
              <SafeAppAlert />
              {!isPoolSwap && (
                <ChainSelect
                  value={selectedChain}
                  onChange={newValue => {
                    setSelectedChain(newValue as GqlChain)
                    setTokenInAmount('')
                  }}
                />
              )}
              <VStack w="full">
                <TokenInput
                  ref={finalRefTokenIn}
                  address={tokenIn.address}
                  chain={selectedChain}
                  value={tokenIn.amount}
                  onChange={e => setTokenInAmount(e.currentTarget.value as HumanAmount)}
                  toggleTokenSelect={() => openTokenSelectModal('tokenIn')}
                />
                <Box position="relative" border="red 1px solid">
                  <IconButton
                    position="absolute"
                    variant="tertiary"
                    size="sm"
                    fontSize="2xl"
                    ml="-4"
                    mt="-4"
                    w="8"
                    h="8"
                    isRound={true}
                    aria-label="Switch tokens"
                    icon={<Repeat size={16} />}
                    onClick={switchTokens}
                  />
                </Box>
                <TokenInput
                  ref={finalRefTokenOut}
                  address={tokenOut.address}
                  chain={selectedChain}
                  value={tokenOut.amount}
                  onChange={e => setTokenOutAmount(e.currentTarget.value as HumanAmount)}
                  toggleTokenSelect={() => openTokenSelectModal('tokenOut')}
                  hasPriceImpact
                  disableBalanceValidation
                  isLoadingPriceImpact={
                    simulationQuery.isLoading || !simulationQuery.data || !tokenIn.amount
                  }
                />
              </VStack>
              {!!simulationQuery.data && (
                <motion.div
                  style={{ width: '100%', transformOrigin: 'top' }}
                  initial={{ opacity: 0, scaleY: 0.9 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                >
                  <PriceImpactAccordion
                    setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
                    accordionButtonComponent={<SwapRate />}
                    accordionPanelComponent={<SwapDetails />}
                    isDisabled={!simulationQuery.data}
                  />
                </motion.div>
              )}

              {simulationQuery.isError && (
                <ErrorAlert title="Error fetching swap">
                  {parseSwapError(simulationQuery.error?.message)}
                </ErrorAlert>
              )}
            </VStack>
          </CardBody>
          <CardFooter>
            {isConnected ? (
              <Tooltip label={isDisabled ? disabledReason : ''}>
                <Button
                  ref={nextBtn}
                  variant="secondary"
                  w="full"
                  size="lg"
                  isDisabled={isDisabled || !isMounted}
                  isLoading={isLoading}
                  loadingText={loadingText}
                  onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
                >
                  Next
                </Button>
              </Tooltip>
            ) : (
              <ConnectWallet
                variant="primary"
                w="full"
                size="lg"
                isLoading={isLoading}
                loadingText={loadingText}
              />
            )}
          </CardFooter>
        </Card>
      </Center>
      {isPoolSwap ? (
        <CompactTokenSelectModal
          finalFocusRef={tokenSelectKey === 'tokenIn' ? finalRefTokenIn : finalRefTokenOut}
          chain={selectedChain}
          tokens={tokens}
          isOpen={tokenSelectDisclosure.isOpen}
          onOpen={tokenSelectDisclosure.onOpen}
          onClose={tokenSelectDisclosure.onClose}
          onTokenSelect={handleTokenSelectForPoolSwap}
        />
      ) : (
        <TokenSelectModal
          finalFocusRef={tokenSelectKey === 'tokenIn' ? finalRefTokenIn : finalRefTokenOut}
          chain={selectedChain}
          tokens={tokens}
          currentToken={tokenSelectKey === 'tokenIn' ? tokenIn.address : tokenOut.address}
          isOpen={tokenSelectDisclosure.isOpen}
          onOpen={tokenSelectDisclosure.onOpen}
          onClose={tokenSelectDisclosure.onClose}
          onTokenSelect={handleTokenSelect}
        />
      )}

      <SwapPreviewModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onOpen={previewModalDisclosure.onOpen}
        onClose={onModalClose}
      />
    </FadeInOnView>
  )
}
