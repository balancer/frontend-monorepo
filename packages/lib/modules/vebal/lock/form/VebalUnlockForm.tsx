'use client'

import {
  Box,
  Card,
  CardHeader,
  HStack,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CardBody,
  CardProps,
  Skeleton,
} from '@chakra-ui/react'
import { LockMode, useVebalLock } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { VebalLockModal } from '@repo/lib/modules/vebal/lock/modal/VebalLockModal'
import NextLink from 'next/link'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useRouter } from 'next/navigation'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/lock/VebalLockInfoProvider'
import { useClickable } from '@chakra-ui/clickable'
import { getModalLabel } from '@repo/lib/modules/vebal/lock/steps/lock.helpers'
import { format } from 'date-fns'
import { PRETTY_DATE_FORMAT } from '@repo/lib/modules/vebal/lock/duration/constants'

export interface ClickableCardProps extends CardProps {
  color?: string
}

export function ClickableCard(props: ClickableCardProps) {
  const clickableProps = useClickable(props)
  return <Card {...clickableProps} />
}

export function VebalUnlockForm() {
  const { refetchAll, mainnetLockedInfo, isLoading } = useVebalLockInfo()
  const { vebalToken, previewModalDisclosure } = useVebalLock()

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
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <span>{getModalLabel(LockMode.Unlock, false)}</span>
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="lg" w="full">
          <Alert status="error" w="full">
            <AlertIcon />
            <VStack alignItems="start">
              <AlertTitle>
                Your veBAL expired on{' '}
                {isLoading ? (
                  <Skeleton display="inline-block" h="16px" w="100px" />
                ) : (
                  lockedEndDateFormatted
                )}
              </AlertTitle>
              <AlertDescription>
                You are no longer receiving veBAL benefits like voting incentives and a share of
                protocol revenue.
              </AlertDescription>
            </VStack>
          </Alert>
          <VStack align="start" spacing="sm" w="full">
            <Text fontSize="sm" fontWeight="700" lineHeight="18px">
              Locked amount
            </Text>
            {isLoading ? (
              <Skeleton h="75px" w="full" />
            ) : (
              <Card variant="subSection">
                <TokenRow
                  address={vebalToken.address as Address}
                  chain={GqlChain.Mainnet}
                  value={mainnetLockedInfo.lockedAmount ?? 0}
                />
              </Card>
            )}
          </VStack>
          <VStack align="start" spacing="md" w="full">
            <HStack justifyContent="space-between" spacing="md" w="full">
              <Text fontSize="sm" fontWeight="700" lineHeight="18px">
                Your options
              </Text>
            </HStack>
            {isLoading ? (
              <Skeleton h="100px" w="full" />
            ) : (
              <Card as={NextLink} href="/vebal/manage/lock" variant="subSection">
                <Text color="font.light" fontWeight="700">
                  Extend lock
                </Text>
                <CardBody color="font.secondary">
                  Regain your veBAL benefits: Voting incentives, protocol revenue, voting power and
                  boosted LP yield
                </CardBody>
              </Card>
            )}
            {isLoading ? (
              <Skeleton h="100px" w="full" />
            ) : (
              <ClickableCard onClick={previewModalDisclosure.onOpen} variant="subSection">
                <Text color="font.light" fontWeight="700">
                  Unlock & Withdraw tokens
                </Text>
                <CardBody color="font.secondary">
                  Unlock tokens first and then be free to withdraw the underlying BAL / WETH / ETH
                  tokens back into your wallet.
                </CardBody>
              </ClickableCard>
            )}
          </VStack>
        </VStack>
      </Card>
      <VebalLockModal
        extendExpired={false}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
      />
    </Box>
  )
}
