import { NumberText } from '@repo/lib/shared/components/typography/NumberText'
import { HStack, VStack, Text, Skeleton } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useVebalLock } from './VebalLockProvider'

interface VebalLockDetailsProps {
  variant: 'summary' | 'detailed'
  isLoading?: boolean
}

export function VebalLockDetails({ variant, isLoading }: VebalLockDetailsProps) {
  const detailed = variant === 'detailed'

  const { shareOfVeBal, expectedVeBalAmount, lockDuration } = useVebalLock()
  const { totalExpectedVeBal } = expectedVeBalAmount

  const lockedUntilDateFormatted =
    lockDuration.lockedUntilDateFormatted &&
    lockDuration.lockedUntilDateFormatted !== lockDuration.lockUntilDateFormatted
      ? lockDuration.lockedUntilDateFormatted
      : undefined

  return (
    <VStack align="start" fontSize="sm" spacing="sm" w="full">
      <HStack justify="space-between" w="full">
        <Text color="grayText">Total share of veBAL</Text>
        <HStack>
          {isLoading ? (
            <Skeleton h="16px" w="40px" />
          ) : shareOfVeBal ? (
            <NumberText color="grayText">
              {fNum('sharePercent', shareOfVeBal?.toNumber())}
            </NumberText>
          ) : null}
        </HStack>
      </HStack>
      {lockedUntilDateFormatted && (
        <HStack justify="space-between" w="full">
          <Text color="grayText">Prior lock-up end date</Text>
          <HStack>
            {isLoading ? (
              <Skeleton h="16px" w="40px" />
            ) : (
              <NumberText color="grayText">{lockedUntilDateFormatted}</NumberText>
            )}
          </HStack>
        </HStack>
      )}
      <HStack justify="space-between" w="full">
        <Text color="grayText">
          {lockedUntilDateFormatted ? 'New lock-up end date' : 'Lock-up end date'}
        </Text>
        <HStack>
          {isLoading ? (
            <Skeleton h="16px" w="40px" />
          ) : (
            <NumberText color="grayText">{lockDuration.lockUntilDateFormatted}</NumberText>
          )}
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text>Total veBAL {lockedUntilDateFormatted && ' (with extended lock)'}</Text>
        <HStack>
          {isLoading ? (
            <Skeleton h="16px" w="40px" />
          ) : (
            <NumberText fontWeight={detailed ? '700' : undefined}>
              {totalExpectedVeBal.eq(0) ? '-' : fNum('token', totalExpectedVeBal)}
            </NumberText>
          )}
        </HStack>
      </HStack>
    </VStack>
  )
}
