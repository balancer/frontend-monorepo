import { useCheckForSimilarPools } from './useCheckForSimilarPools'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { getChainShortName } from '@repo/lib/config/app.config'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  Modal,
  ModalContent,
  ModalBody,
  VStack,
  Button,
  HStack,
  useDisclosure,
  Card,
  Text,
  Box,
} from '@chakra-ui/react'
import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import { useEffect } from 'react'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { Link } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { getPoolPath } from '@repo/lib/modules/pool/pool.utils'
import NextLink from 'next/link'

export function SimilarPoolsModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { poolCreationForm, resetPoolCreationForm } = usePoolCreationForm()
  const { network, hasAcceptedSimilarPoolsWarning } = poolCreationForm.watch()
  const { similarPools } = useCheckForSimilarPools()

  useEffect(() => {
    if (!hasAcceptedSimilarPoolsWarning && similarPools && similarPools.length > 0) {
      onOpen()
    }
  }, [hasAcceptedSimilarPoolsWarning, similarPools])

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
      <SuccessOverlay />
      <ModalContent bg="background.level1">
        <ModalBody padding="lg">
          <VStack spacing="md">
            <BalAlert
              content="You can still create this pool, but you'll fragment liquidity making your pool less profitable (on top of additional set up gas fees)."
              status="warning"
              title={`Similar pools already exist on ${getChainShortName(network)} (${PROJECT_CONFIG.projectName})`}
            />

            {similarPools?.slice(0, 3).map(pool => (
              <Card key={pool.address} position="relative" variant="modalSubSection">
                <VStack spacing="md">
                  <Link
                    as={NextLink}
                    href={getPoolPath({
                      chain: pool.chain,
                      id: pool.address,
                      type: pool.type,
                      protocolVersion: pool.protocolVersion,
                    })}
                    position="absolute"
                    rel="noopener noreferrer"
                    right="sm"
                    target="_blank"
                    top="sm"
                    zIndex={1}
                  >
                    <Box bg="background.level4" color="font.link" p="sm" rounded="full" shadow="md">
                      <ArrowUpRight size={16} />
                    </Box>
                  </Link>
                  <HStack w="full">
                    <Text>{pool.symbol}</Text>
                  </HStack>
                  <HStack flexWrap="wrap" gap="sm" width="full">
                    <NetworkIcon chain={network} size={9} withPadding={false} />

                    {pool.poolTokens.map(token => (
                      <Box flexShrink={0} key={token.address}>
                        <Card p="sm" rounded="full" variant="subSection" width="fit-content">
                          <HStack>
                            <TokenIcon
                              address={token.address}
                              alt={token.symbol}
                              chain={network}
                              size={20}
                            />

                            <Text fontWeight="bold">{token.symbol}</Text>

                            {token.weight && (
                              <Text fontSize="sm">{fNum('weight', token.weight)}</Text>
                            )}
                          </HStack>
                        </Card>
                      </Box>
                    ))}
                  </HStack>
                  <HStack spacing="sm" w="full">
                    <Text color="font.secondary" fontSize="sm">
                      Type: {pool.type.toLowerCase()}
                    </Text>

                    <Text color="font.secondary">•</Text>

                    <Text color="font.secondary" fontSize="sm">
                      TVL: {fNum('fiat', pool.dynamicData.totalLiquidity)}
                    </Text>

                    <Text color="font.secondary">•</Text>

                    <Text color="font.secondary" fontSize="sm">
                      Swap fees: {fNum('feePercent', pool.dynamicData.swapFee)}
                    </Text>
                  </HStack>
                </VStack>
              </Card>
            ))}

            <HStack display="grid" gap="md" gridTemplateColumns="1fr 1fr" mt="sm" w="full">
              <Button
                onClick={() => {
                  poolCreationForm.setValue('hasAcceptedSimilarPoolsWarning', true)
                  onClose()
                }}
                size="lg"
                variant="secondary"
              >
                Continue anyway
              </Button>

              <Button
                onClick={() => {
                  resetPoolCreationForm()
                  onClose()
                }}
                size="lg"
                variant="tertiary"
              >
                Reset and start over
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
