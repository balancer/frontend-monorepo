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
import { useVebalUserData } from '@/lib/modules/vebal/useVebalUserData'
import { useVebalLockInfo } from '@/lib/modules/vebal/useVebalLockInfo'

import { CrossChainSyncModal } from '@/lib/modules/vebal/cross-chain/CrossChainSyncModal'
import { useState } from 'react'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { InfoOutlineIcon } from '@chakra-ui/icons'

const tooltipLabel = `Sidechains & Layer 2 networks like Polygon and Arbitrum don't know 
                    your veBAL balance on Ethereum Mainnet, 
                    unless you sync it. 
                    On any network where you stake, you should sync your veBAL balance to get your max possible boost. 
                    Resync after acquiring more veBAL to continue boosting to your max.`

export function CrossChainBoost() {
  const { isConnected } = useUserAccount()
  const { mainnetLockedInfo } = useVebalLockInfo()

  const { hasExistingLock, isExpired } = mainnetLockedInfo
  const { networksBySyncState, l2VeBalBalances, isLoading, showingUnsyncedNetworks } =
    useCrossChainSync()

  const [syncIsOpen, setSyncIsOpen] = useState(false)

  const { data } = useVebalUserData()

  const myVebalBalance = data?.veBalGetUser.balance

  return (
    <Stack w="full" h="full" height="300px">
      <HStack>
        <Text fontWeight="bold" fontSize="lg">
          Cross chain veBAL boosts
        </Text>

        <Tooltip label={tooltipLabel}>
          <InfoOutlineIcon fontSize="sm" color="font.light" />
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
                              key={chain}
                              src={`/images/chains/${chain}.svg`}
                              alt={`Chain icon for ${chain.toLowerCase()}`}
                              width={20}
                              height={20}
                              title={`${chain} (${Number(myVebalBalance).toFixed(4)} - ${
                                l2VeBalBalances[chain]
                              })`}
                            />
                          ))}
                        </Flex>
                      ) : (
                        <Text>All networks are synced</Text>
                      )}
                    </CardBody>
                    <CardFooter>
                      <Button size="lg" variant="primary" onClick={() => setSyncIsOpen(true)}>
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
                              key={chain}
                              src={`/images/chains/${chain}.svg`}
                              alt={`Chain icon for ${chain.toLowerCase()}`}
                              width={20}
                              height={20}
                              title={chain}
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
