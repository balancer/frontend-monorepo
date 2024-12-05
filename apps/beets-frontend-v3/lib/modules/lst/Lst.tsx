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
  VStack,
} from '@chakra-ui/react'
import { TokenInput } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useIsMounted } from '@repo/lib/shared/hooks/useIsMounted'
import { useRef } from 'react'
import fantomNetworkConfig from '@repo/lib/config/networks/fantom'

export function Lst() {
  const { isConnected } = useUserAccount()
  const isMounted = useIsMounted()
  const nextBtn = useRef(null)

  const isLoading = !isMounted
  const loadingText = isLoading ? 'Fetching swap...' : undefined

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
          <CardHeader as={HStack} justify="space-between" w="full" zIndex={11}>
            <Box as="span">LST</Box>
          </CardHeader>
          <CardBody align="start" as={VStack}>
            <VStack spacing="md" w="full">
              <TokenInput
                address={fantomNetworkConfig.tokens.nativeAsset.address}
                chain={GqlChain.Fantom}
                onChange={e => console.log(e.currentTarget.value)}
                value="0"
              />

              {/* {simulationQuery.isError ? (
                <ErrorAlert title="Error fetching swap">
                  {parseSwapError(simulationQuery.error?.message)}
                </ErrorAlert>
              ) : null} */}
            </VStack>
          </CardBody>
          <CardFooter>
            {isConnected ? (
              //   <Tooltip label={isDisabled ? disabledReason : ''}>
              <Button
                isDisabled={false}
                isLoading={false}
                loadingText={loadingText}
                // onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
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
      {/* <SwapPreviewModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={previewModalDisclosure.onOpen}
      /> */}
    </FadeInOnView>
  )
}
