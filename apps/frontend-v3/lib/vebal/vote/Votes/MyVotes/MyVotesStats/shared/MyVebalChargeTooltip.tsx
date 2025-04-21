import {
  Badge,
  Box,
  Button,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import { differenceInSeconds, format } from 'date-fns'
import { oneYearInSecs } from '@repo/lib/shared/utils/time'
import { BatteryChargeIcon } from '@repo/lib/shared/components/icons/BatteryChargeIcon'
import React from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { PRETTY_DATE_FORMAT } from '@bal/lib/vebal/lock/duration/lock-duration.constants'
import NextLink from 'next/link'
import { getVeBalManagePath } from '@bal/lib/vebal/vebal-navigation'

interface Props {
  lockedEndDate: number
  expectedVeBalAmount: number
  isLockExpired?: boolean
  usePortal?: boolean
}

function getLockedEndDatePercentage(lockedEndDate: number) {
  const difference = differenceInSeconds(lockedEndDate, Date.now())
  return (100 * Math.max(difference, 0)) / oneYearInSecs
}

export function MyVebalChargeTooltip({
  lockedEndDate,
  isLockExpired,
  expectedVeBalAmount,
  usePortal,
}: Props) {
  const lockedEndDatePercentage = getLockedEndDatePercentage(lockedEndDate)

  const popoverContent = (
    <PopoverContent bg="background.base" minWidth={['100px']} px="sm" py="ms" shadow="3xl">
      <VStack alignItems="start" spacing="sm" width="full">
        <HStack justifyContent="space-between" w="full">
          <Text fontSize="sm" fontWeight={700}>
            veBAL charge
          </Text>
          <Text fontSize="sm" fontWeight={700}>
            {fNum('apr', lockedEndDatePercentage / 100)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between" w="full">
          <Text fontSize="sm" fontWeight={700}>
            Expiry date
          </Text>
          <Text fontSize="sm" fontWeight={700}>
            {format(lockedEndDate, PRETTY_DATE_FORMAT)}
          </Text>
        </HStack>
        <HStack justifyContent="space-between" w="full">
          <Text fontSize="sm" fontWeight={700}>
            veBAL with 1 year lock
          </Text>
          <Text fontSize="sm" fontWeight={700}>
            {fNum('token', expectedVeBalAmount)}
          </Text>
        </HStack>
        <HStack mt="sm" spacing="sm">
          <Button
            as={NextLink}
            href={getVeBalManagePath('extend', 'vote')}
            size="sm"
            variant="secondary"
          >
            Extend lock
          </Button>
          {isLockExpired && (
            <Button
              as={NextLink}
              href={getVeBalManagePath('unlock', 'vote')}
              size="sm"
              variant="tertiary"
            >
              Unlock
            </Button>
          )}
        </HStack>
      </VStack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <Box>
            {isLockExpired ? (
              <Badge
                background="red.500"
                color="font.maxContrast"
                fontSize="sm"
                textTransform="unset"
                userSelect="none"
              >
                Expired
              </Badge>
            ) : (
              <BatteryChargeIcon percentage={lockedEndDatePercentage} />
            )}
          </Box>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
