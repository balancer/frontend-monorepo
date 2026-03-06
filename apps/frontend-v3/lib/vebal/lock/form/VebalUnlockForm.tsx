'use client'

import { Box, Card, HStack, VStack, Flex, Text, Alert, CardProps, Skeleton } from '@chakra-ui/react'
import { LockMode, useVebalLock } from '@bal/lib/vebal/lock/VebalLockProvider'
import { VebalLockModal } from '@bal/lib/vebal/lock/modal/VebalLockModal'
import NextLink from 'next/link'
import { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useRouter } from 'next/navigation'

import { getModalLabel } from '@bal/lib/vebal/lock/steps/lock-steps.utils'
import { format } from 'date-fns'
import { PRETTY_DATE_FORMAT } from '@bal/lib/vebal/lock/duration/lock-duration.constants'
import { TokenRowWithDetails } from '@repo/lib/modules/tokens/TokenRow/TokenRowWithDetails'
import { useVebalLockData } from '@repo/lib/modules/vebal/VebalLockDataProvider'
import { ArrowRight } from 'react-feather'

export interface ClickableCardProps extends CardProps {
  color?: string
}

export function ClickableCard(props: ClickableCardProps) {
  return <Card.Root cursor="pointer" {...props} />
}

export function VebalUnlockForm() {
  const { refetchAll, mainnetLockedInfo, isLoading } = useVebalLockData()
  const { vebalBptToken, previewModalDisclosure, lockDuration } = useVebalLock()

  const router = useRouter()

  function onModalClose(isSuccess: boolean) {
    previewModalDisclosure.onClose()
    refetchAll()
    if (isSuccess) {
      router.push('/vebal/manage')
    }
  }

  const lockedEndDateFormatted = mainnetLockedInfo.lockedEndDate
    ? format(new Date(mainnetLockedInfo.lockedEndDate), PRETTY_DATE_FORMAT)
    : undefined

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between" w="full">
            <span>{getModalLabel(LockMode.Unlock, false, false)}</span>
          </HStack>
        </Card.Header>
        <VStack align="start" gap="lg" w="full">
          <Alert.Root status="error" w="full">
            <Alert.Indicator />
            <VStack alignItems="start" gap="none">
              <Alert.Title>
                Your veBAL expired on{' '}
                {isLoading ? (
                  <Skeleton display="inline-block" h="16px" w="100px" />
                ) : (
                  lockedEndDateFormatted
                )}
              </Alert.Title>
              <Alert.Description>
                You are no longer receiving veBAL benefits like voting incentives and a share of
                protocol revenue.
              </Alert.Description>
            </VStack>
          </Alert.Root>
          <VStack align="start" gap="sm" w="full">
            <Text fontSize="sm" fontWeight="700" lineHeight="18px">
              Locked amount
            </Text>
            {isLoading ? (
              <Skeleton h="75px" w="full" />
            ) : (
              <Card.Root variant="subSection">
                <TokenRowWithDetails
                  address={vebalBptToken.address as Address}
                  chain={GqlChain.Mainnet}
                  details={
                    lockDuration.lockedUntilDateFormatted
                      ? [
                          [
                            <Text fontSize="sm" key={1} variant="secondary">
                              Lock-up period ended
                            </Text>,
                            <Text fontSize="sm" key={2} variant="secondary">
                              {lockDuration.lockedUntilDateFormatted}
                            </Text>,
                          ],
                        ]
                      : undefined
                  }
                  value={mainnetLockedInfo.lockedAmount ?? 0}
                />
              </Card.Root>
            )}
          </VStack>
          <VStack align="start" gap="md" w="full">
            <HStack gap="md" justifyContent="space-between" w="full">
              <Text fontSize="sm" fontWeight="700" lineHeight="18px">
                Your options:
              </Text>
            </HStack>
            {isLoading ? (
              <Skeleton h="100px" w="full" />
            ) : (
              <Card.Root
                _hover={{ shadow: 'sm' }}
                asChild
                role="group"
                shadow="2xl"
                variant="subSection"
              >
                <NextLink href="/vebal/manage/extend">
                  <Flex
                    alignItems="center"
                    gap={{ base: 'lg', md: '2xl' }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Text _groupHover={{ color: 'font.highlight' }} fontWeight="700" mb="xs">
                        Extend lock
                      </Text>
                      <Card.Body color="font.secondary">
                        <Text
                          _groupHover={{ color: 'font.maxContrast' }}
                          css={{
                            textWrap: 'balanced',
                          }}
                          fontSize="sm"
                          variant="secondary"
                        >
                          Regain your veBAL benefits: Voting incentives, protocol revenue, voting
                          power and boosted LP yield
                        </Text>
                      </Card.Body>
                    </Box>
                    <Box _groupHover={{ color: 'font.highlight' }} color="font.link">
                      <ArrowRight size="16" />
                    </Box>
                  </Flex>
                </NextLink>
              </Card.Root>
            )}
            {isLoading ? (
              <Skeleton h="100px" w="full" />
            ) : (
              <Box role="group">
                <ClickableCard
                  _hover={{ shadow: 'sm' }}
                  onClick={previewModalDisclosure.onOpen}
                  shadow="2xl"
                  variant="subSection"
                >
                  <Flex
                    alignItems="center"
                    gap={{ base: 'lg', md: '2xl' }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Text _groupHover={{ color: 'font.highlight' }} fontWeight="700" mb="xs">
                        Unlock & Withdraw tokens
                      </Text>
                      <Card.Body color="font.secondary">
                        <Text
                          _groupHover={{ color: 'font.maxContrast' }}
                          css={{
                            textWrap: 'balanced',
                          }}
                          fontSize="sm"
                          variant="secondary"
                        >
                          Unlock tokens first and then be free to withdraw the underlying BAL / WETH
                          / ETH tokens back into your wallet.
                        </Text>
                      </Card.Body>
                    </Box>
                    <Box _groupHover={{ color: 'font.highlight' }} color="font.link">
                      <ArrowRight size="16" />
                    </Box>
                  </Flex>
                </ClickableCard>
              </Box>
            )}
          </VStack>
        </VStack>
      </Card.Root>
      <VebalLockModal
        extendExpired={false}
        isOpen={previewModalDisclosure.open}
        onClose={onModalClose}
      />
    </Box>
  )
}
