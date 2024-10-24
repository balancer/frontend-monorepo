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
  const { minLockVeBal, bonusVeBal, totalExpectedVeBal } = expectedVeBalAmount

  return (
    <VStack align="start" fontSize="sm" spacing="sm" w="full">
      {!!detailed && (
        <HStack justify="space-between" w="full">
          <Text color="grayText">veBAL (from minimum lock)</Text>
          <HStack>
            {isLoading ? (
              <Skeleton h="16px" w="40px" />
            ) : (
              <NumberText color="grayText">
                {minLockVeBal.eq(0) ? '-' : fNum('token', minLockVeBal)}
              </NumberText>
            )}
          </HStack>
        </HStack>
      )}
      {!!detailed && (
        <HStack justify="space-between" w="full">
          <Text color="grayText">Bonus veBAL (from extended lock)</Text>
          <HStack>
            {isLoading ? (
              <Skeleton h="16px" w="40px" />
            ) : (
              <NumberText color="grayText">
                {bonusVeBal.eq(0) ? '-' : fNum('token', bonusVeBal)}
              </NumberText>
            )}
          </HStack>
        </HStack>
      )}
      <HStack justify="space-between" w="full">
        <Text>Total veBAL</Text>
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
      <HStack justify="space-between" mt={variant === 'detailed' ? 'sm' : undefined} w="full">
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
      <HStack justify="space-between" w="full">
        <Text color="grayText"> {detailed ? 'veBAL lock-up end date' : 'Lock-up end date'}</Text>
        <HStack>
          {isLoading ? (
            <Skeleton h="16px" w="40px" />
          ) : (
            <NumberText color="grayText">{lockDuration.lockUntilDateFormatted}</NumberText>
          )}
        </HStack>
      </HStack>
    </VStack>
  )
}
