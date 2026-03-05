'use client';
import {
  Button,
  Card,
  Flex,
  GridItem,
  HStack,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Icon } from '@chakra-ui/react';

import { Tooltip } from '@repo/lib/shared/components/tooltips/Tooltip';

import { useCrossChainSync } from './CrossChainSyncProvider'
import Image from 'next/image'
import { useVebalUserData } from '@bal/lib/vebal/useVebalUserData'

import { CrossChainSyncModal } from '@bal/lib/vebal/cross-chain/CrossChainSyncModal'
import { useState } from 'react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { formatUnits } from 'viem'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'
// @ts-ignore
import { LuInfo } from 'react-icons/lu';

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

  const { veBALBalance } = useVebalUserData()

  return (
    <Stack h="full" height="300px" w="full">
      <HStack>
        <Text fontSize="lg" fontWeight="bold">
          Cross chain veBAL boosts
        </Text>

        <Tooltip content={tooltipLabel}>
          <Icon color="font.light" fontSize="sm" asChild><LuInfo /></Icon>
        </Tooltip>
      </HStack>
      {isConnected ? (
        <>
          {!hasExistingLock || (hasExistingLock && isExpired) ? (
            <Text>Once you have some veBAL, sync your balance here to other networks.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
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
                  <Card.Root h="100%">
                    <Card.Header>Unsynced networks</Card.Header>
                    <Card.Body>
                      {showingUnsyncedNetworks.length ? (
                        <Flex>
                          {showingUnsyncedNetworks.map(chain => (
                            <Image
                              alt={`Chain icon for ${chain.toLowerCase()}`}
                              height={20}
                              key={chain}
                              src={`/images/chains/${chain}.svg`}
                              title={`${chain} (${formatUnits(veBALBalance, 18)} - ${
                                l2VeBalBalances[chain]
                              })`}
                              width={20}
                            />
                          ))}
                        </Flex>
                      ) : (
                        <Text>All networks are synced</Text>
                      )}
                    </Card.Body>
                    <Card.Footer>
                      <Button onClick={() => setSyncIsOpen(true)} size="lg" variant="primary">
                        Sync
                      </Button>
                    </Card.Footer>
                  </Card.Root>
                )}
              </GridItem>
              <GridItem>
                {isLoading ? (
                  <Skeleton height="126px" />
                ) : (
                  <Card.Root h="100%">
                    <Card.Header>Synced networks</Card.Header>
                    <Card.Body>
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
                    </Card.Body>
                  </Card.Root>
                )}
              </GridItem>
            </SimpleGrid>
          )}
        </>
      ) : (
        <Text>Once you have some veBAL, sync your balance here to other networks.</Text>
      )}
    </Stack>
  );
}
