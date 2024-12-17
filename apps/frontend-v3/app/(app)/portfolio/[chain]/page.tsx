'use client'
import { PoolName } from '@repo/lib/modules/pool/PoolName'
import { Pool } from '@repo/lib/modules/pool/PoolProvider'
import { ClaimModal } from '@repo/lib/modules/pool/actions/claim/ClaimModal'
import { ClaimProvider } from '@repo/lib/modules/pool/actions/claim/ClaimProvider'
import { ChainSlug, getChainSlug } from '@repo/lib/modules/pool/pool.utils'
// eslint-disable-next-line max-len
import { ClaimNetworkPoolsLayout } from '@repo/lib/modules/portfolio/PortfolioClaim/ClaimNetworkPools/ClaimNetworkPoolsLayout'
import { usePortfolio } from '@repo/lib/modules/portfolio/PortfolioProvider'
import { TokenIconStack } from '@repo/lib/modules/tokens/TokenIconStack'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { Button, Card, HStack, Heading, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { capitalize } from 'lodash'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function NetworkClaim() {
  const { toCurrency } = useCurrency()
  const { chain } = useParams()
  const {
    poolsByChainMap,
    poolRewardsMap,
    totalFiatClaimableBalanceByChain,
    isLoadingRewards,
    refetchClaimPoolData,
  } = usePortfolio()

  const gqlChain = getChainSlug(chain as ChainSlug)
  const pools = poolsByChainMap[gqlChain]
  const chainName = capitalize(chain as string)
  const claimableFiatBalance = totalFiatClaimableBalanceByChain[gqlChain]

  const isClaimAllDisabled = pools?.every(pool =>
    poolRewardsMap[pool.id]?.totalFiatClaimBalance?.isEqualTo(0)
  )

  const [modalPools, setModalPools] = useState<Pool[]>([])

  const hasMultipleClaims = pools ? pools.length > 1 : false

  return (
    <TransactionStateProvider>
      <ClaimNetworkPoolsLayout backLink="/portfolio" title="Portfolio">
        <HStack justifyContent="space-between" pb="1">
          <HStack spacing="xs">
            <NetworkIcon chain={gqlChain} size={12} />
            <Stack spacing="none">
              <Heading size="md">{chainName} incentives</Heading>
            </Stack>
          </HStack>
          <Heading size="md" variant="special">
            {claimableFiatBalance && toCurrency(claimableFiatBalance)}
          </Heading>
        </HStack>
        <Stack gap="md" py="4">
          {isLoadingRewards ? (
            <Skeleton height="126px" />
          ) : pools && pools.length > 0 ? (
            pools?.map(
              pool =>
                poolRewardsMap[pool.id]?.totalFiatClaimBalance?.isGreaterThan(0) && (
                  <Card key={pool.id} variant="subSection">
                    <VStack align="start">
                      <HStack w="full">
                        <PoolName fontSize="lg" fontWeight="bold" pool={pool} />
                        <Text fontWeight="bold" ml="auto" variant="special">
                          {toCurrency(
                            poolRewardsMap[pool.id]?.totalFiatClaimBalance?.toNumber() || 0
                          )}
                        </Text>
                      </HStack>
                      <HStack w="full">
                        <TokenIconStack chain={pool.chain} size={36} tokens={pool.displayTokens} />
                        {hasMultipleClaims && (
                          <Button
                            minW="60px"
                            ml="auto"
                            onClick={() => {
                              setModalPools([pool])
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            Claim
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </Card>
                )
            )
          ) : (
            <Text p="10" textAlign="center" variant="secondary">
              You have no liquidity incentives to claim
            </Text>
          )}
        </Stack>
        {pools && pools.length > 0 && (
          <Button
            isDisabled={isClaimAllDisabled}
            onClick={() => {
              setModalPools(pools)
            }}
            size="lg"
            variant="secondary"
            width="100%"
          >
            {`Claim${hasMultipleClaims ? ' all' : ''}`}
          </Button>
        )}
        {modalPools.length > 0 && (
          <ClaimProvider pools={modalPools}>
            <ClaimModal
              chain={gqlChain}
              isOpen={modalPools.length > 0}
              onClose={(isSuccess: boolean) => {
                if (isSuccess) {
                  refetchClaimPoolData()
                }

                setModalPools([])
              }}
            />
          </ClaimProvider>
        )}
      </ClaimNetworkPoolsLayout>
    </TransactionStateProvider>
  )
}
