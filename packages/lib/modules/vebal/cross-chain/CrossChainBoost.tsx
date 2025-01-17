'use client'

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  GridItem,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react'

import { useCrossChainSync } from './CrossChainSyncProvider'
import Image from 'next/image'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'

import { CrossChainSyncModal } from '@repo/lib/modules/vebal/cross-chain/CrossChainSyncModal'
import { useState } from 'react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { InfoOutlineIcon } from '@chakra-ui/icons'

const tooltipLabel = `Sidechains & Layer 2 networks like Polygon and Arbitrum don't know 
                    your veBAL balance on Ethereum Mainnet, 
                    unless you sync it. 
                    On any network where you stake, you should sync your veBAL balance to get your max possible boost. 
                    Resync after acquiring more veBAL to continue boosting to your max.`

export function CrossChainBoost() {
  const { isConnected } = useUserAccount()
  const { mainnetLockedInfo } = useVebalLockData()

  const { hasExistingLock, isExpired } = mainnetLockedInfo
  const { networksBySyncState, l2VeBalBalances, isLoading, showingUnsyncedNetworks } =
    useCrossChainSync()

  const [syncIsOpen, setSyncIsOpen] = useState(false)

  const { myVebalBalance } = useVebalUserData()

  return (
    <Stack h="full" height="300px" w="full">
      <HStack>
        <Text fontSize="lg" fontWeight="bold">
          Cross chain veBAL boosts
        </Text>

        <Tooltip label={tooltipLabel}>
          <InfoOutlineIcon color="font.light" fontSize="sm" />
        </Tooltip>
      </HStack>
      {isConnected ? (
        <>
          {!hasExistingLock || (hasExistingLock && isExpired) ? (
            <Text>Once you have some veBAL, sync your balance here to other networks.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="md">
              {showingUnsyncedNetworks.length > 0 && (
                <CrossChainSyncModal
                  isOpen={syncIsOpen}
                  networks={showingUnsyncedNetworks}
                  onClose={() => setSyncIsOpen(false)}
                />
              )}
              <GridItem>
                {isLoading ? (
                  <Skeleton height="126px" />
                ) : (
                  <Card h="100%">
                    <CardHeader>Unsynced networks</CardHeader>
                    <CardBody>
                      {showingUnsyncedNetworks.length ? (
                        <Flex>
                          {showingUnsyncedNetworks.map(chain => (
                            <Image
                              alt={`Chain icon for ${chain.toLowerCase()}`}
                              height={20}
                              key={chain}
                              src={`/images/chains/${chain}.svg`}
                              title={`${chain} (${Number(myVebalBalance ?? 0).toFixed(4)} - ${
                                l2VeBalBalances[chain]
                              })`}
                              width={20}
                            />
                          ))}
                        </Flex>
                      ) : (
                        <Text>All networks are synced</Text>
                      )}
                    </CardBody>
                    <CardFooter>
                      <Button onClick={() => setSyncIsOpen(true)} size="lg" variant="primary">
                        Sync
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </GridItem>
              <GridItem>
                {isLoading ? (
                  <Skeleton height="126px" />
                ) : (
                  <Card h="100%">
                    <CardHeader>Synced networks</CardHeader>
                    <CardBody>
                      {networksBySyncState.synced.length ? (
                        <Flex>
                          {networksBySyncState.synced.map(chain => (
                            <Image
                              alt={`Chain icon for ${chain.toLowerCase()}`}
                              height={20}
                              key={chain}
                              src={`/images/chains/${chain}.svg`}
                              title={chain}
                              width={20}
                            />
                          ))}
                        </Flex>
                      ) : (
                        <Text>
                          Sync veBAL across networks for a boosted APR on your staked positions.
                        </Text>
                      )}
                    </CardBody>
                  </Card>
                )}
              </GridItem>
            </SimpleGrid>
          )}
        </>
      ) : (
        <Text>Once you have some veBAL, sync your balance here to other networks.</Text>
      )}
    </Stack>
  )
}
