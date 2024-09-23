'use client'

import { TokenInput } from '@/lib/modules/tokens/TokenInput/TokenInput'
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
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
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import { ErrorAlert } from '@/lib/shared/components/errors/ErrorAlert'
import { useIsMounted } from '@/lib/shared/hooks/useIsMounted'
import { parseSwapError } from './swap.helpers'
import { useUserAccount } from '../web3/UserAccountProvider'
import { ConnectWallet } from '../web3/ConnectWallet'
import { SafeAppAlert } from '@/lib/shared/components/alerts/SafeAppAlert'

export function SwapForm() {
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

  function openTokenSelectModal(tokenSelectKey: 'tokenIn' | 'tokenOut') {
    setTokenSelectKey(tokenSelectKey)
    tokenSelectDisclosure.onOpen()
  }

  function onModalClose() {
    previewModalDisclosure.onClose()
    if (swapTxHash) {
      resetSwapAmounts()
      replaceUrlPath()
      transactionSteps.resetTransactionSteps()
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
            <span>{capitalize(swapAction)}</span>
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
              <SafeAppAlert />
              <ChainSelect
                value={selectedChain}
                onChange={newValue => {
                  setSelectedChain(newValue as GqlChain)
                  setTokenInAmount('')
                }}
              />
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
      <SwapPreviewModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onOpen={previewModalDisclosure.onOpen}
        onClose={onModalClose}
      />
    </FadeInOnView>
  )
}
