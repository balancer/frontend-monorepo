/* eslint-disable max-len */
'use client'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Heading,
  HStack,
  IconButton,
  Link,
  Stack,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useRef } from 'react'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { useLst } from './LstProvider'
import { LstStakeModal } from './modals/LstStakeModal'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

export function Lst() {
  const { isConnected } = useUserAccount()
  const isMounted = useIsMounted()
  const nextBtn = useRef(null)
  const { activeTab, setActiveTab, tabs, amount, setAmount, chain } = useLst()
  const stakeModalDisclosure = useDisclosure()
  const { startTokenPricePolling } = useTokens()

  const isLoading = !isMounted
  const loadingText = isLoading ? 'Loading...' : undefined

  function onModalClose() {
    // restart polling for token prices when modal is closed again
    startTokenPricePolling()

    stakeModalDisclosure.onClose()

    // if (swapTxHash) {
    //   resetSwapAmounts()
    //   transactionSteps.resetTransactionSteps()
    // }
  }

  return (
    <FadeInOnView>
      <Center
        h="full"
        left={['-12px', '0']}
        maxW="lg"
        mx="auto"
        position="relative"
        w={['100vw', 'full']}
      >
        <Card rounded="xl">
          <CardHeader as={HStack} justify="space-between" w="full">
            <Heading as="h2" size="lg">
              Liquid staking
            </Heading>
          </CardHeader>
          <CardBody align="start" as={VStack}>
            <VStack spacing="md" w="full">
              <ButtonGroup
                currentOption={activeTab}
                groupId="add-liquidity"
                hasLargeTextLabel
                isFullWidth
                onChange={setActiveTab}
                options={tabs}
                size="md"
              />
              <TokenInput
                address={fantomNetworkConfig.tokens.nativeAsset.address}
                chain={chain}
                onChange={e => setAmount(e.currentTarget.value)}
                value={amount}
              />
            </VStack>
          </CardBody>
          <CardFooter>
            {isConnected ? (
              //   <Tooltip label={isDisabled ? disabledReason : ''}>
              <Button
                isDisabled={bn(amount).lt(1)}
                isLoading={isLoading}
                loadingText={loadingText}
                onClick={() => stakeModalDisclosure.onOpen()}
                ref={nextBtn}
                size="lg"
                variant="secondary"
                w="full"
              >
                Next
              </Button>
            ) : (
              //   </Tooltip>
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
      <LstStakeModal
        finalFocusRef={nextBtn}
        isOpen={stakeModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={stakeModalDisclosure.onOpen}
      />
    </FadeInOnView>
  )
}
