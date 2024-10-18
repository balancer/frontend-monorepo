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

export interface ClickableCardProps extends CardProps {
  color?: string
}

export function ClickableCard(props: ClickableCardProps) {
  const clickableProps = useClickable(props)
  return <Card {...clickableProps} />
}

export function VebalUnlockForm() {
  const { refetchAll } = useVebalLockInfo()
  const {
    vebalToken,
    totalAmount,
    previewModalDisclosure,

    lockDuration,
  } = useVebalLock()

  const router = useRouter()

  function onModalClose(isSuccess: boolean) {
    previewModalDisclosure.onClose()
    refetchAll()
    if (isSuccess) {
      router.push('/vebal/manage')
    }
  }

  return (
    <Box w="full" maxW="lg" mx="auto" pb="2xl">
      <Card>
        <CardHeader>
          <HStack w="full" justify="space-between">
            <span>{getModalLabel(LockMode.Unlock, false)}</span>
          </HStack>
        </CardHeader>
        <VStack spacing="lg" align="start" w="full">
          <Alert status="error" w="full">
            <AlertIcon />
            <VStack alignItems="start">
              <AlertTitle>Your veBAL expired on {lockDuration.lockUntilDateFormatted}</AlertTitle>
              <AlertDescription>
                You are no longer receiving veBAL benefits like voting incentives and a share of
                protocol revenue.
              </AlertDescription>
            </VStack>
          </Alert>
          <VStack spacing="sm" align="start" w="full">
            <Text fontSize="sm" lineHeight="18px" fontWeight="700">
              Locked amount
            </Text>
            <Card variant="subSection">
              <TokenRow
                address={vebalToken.address as Address}
                chain={GqlChain.Mainnet}
                value={totalAmount}
              />
            </Card>
          </VStack>
          <VStack spacing="md" align="start" w="full">
            <HStack spacing="md" justifyContent="space-between" w="full">
              <Text fontSize="sm" lineHeight="18px" fontWeight="700">
                Your options
              </Text>
            </HStack>
            <Card as={NextLink} href="/vebal/manage/lock" variant="subSection">
              <Text color="font.light" fontWeight="700">
                Extend lock
              </Text>
              <CardBody color="font.secondary">
                Regain your veBAL benefits: Voting incentives, protocol revenue, voting power and
                boosted LP yield
              </CardBody>
            </Card>
            <ClickableCard onClick={previewModalDisclosure.onOpen} variant="subSection">
              <Text color="font.light" fontWeight="700">
                Unlock & Withdraw tokens
              </Text>
              <CardBody color="font.secondary">
                Unlock tokens first and then be free to withdraw the underlying BAL / WETH / ETH
                tokens back into your wallet.
              </CardBody>
            </ClickableCard>
          </VStack>
        </VStack>
      </Card>
      <VebalLockModal
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        extendExpired={false}
      />
    </Box>
  )
}
