import { NumberText } from '@repo/lib/shared/components/typography/NumberText'
import { HStack, VStack, Text, Skeleton } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { fNum } from '@repo/lib/shared/utils/numbers'

interface VebalLockDetailsProps {
  variant: 'summary' | 'detailed'
  isLoading?: boolean
  lockUntilDateFormatted: string
  totalAmount: BigNumber
  expectedVeBalAmount: BigNumber
}

export function VebalLockDetails({
  variant,
  isLoading,
  lockUntilDateFormatted,
  totalAmount,
  expectedVeBalAmount,
}: VebalLockDetailsProps) {
  const detailed = variant === 'detailed'
  return (
    <VStack spacing="sm" align="start" w="full" fontSize="sm">
      {detailed && (
        <HStack justify="space-between" w="full">
          <Text color="grayText">veBAL (from LP tokens)</Text>
          <HStack>
            {isLoading ? (
              <Skeleton w="40px" h="16px" />
            ) : (
              <NumberText color="grayText">
                {expectedVeBalAmount.eq(0) ? '-' : fNum('token', expectedVeBalAmount)}{' '}
              </NumberText>
            )}
          </HStack>
        </HStack>
      )}
      {detailed && (
        <HStack justify="space-between" w="full">
          <Text color="grayText">Bonus veBAL (from extended lock)</Text>
          <HStack>
            {isLoading ? (
              <Skeleton w="40px" h="16px" />
            ) : (
              // fix: mocked
              <NumberText color="grayText">{fNum('token', 37.5)}</NumberText>
            )}
          </HStack>
        </HStack>
      )}
      <HStack justify="space-between" w="full">
        <Text>Total veBAL</Text>
        <HStack>
          {isLoading ? (
            <Skeleton w="40px" h="16px" />
          ) : (
            <NumberText fontWeight={detailed ? '700' : undefined}>
              {totalAmount.eq(0) ? '-' : fNum('token', totalAmount)}
            </NumberText>
          )}
        </HStack>
      </HStack>
      <HStack mt={variant === 'detailed' ? 'sm' : undefined} justify="space-between" w="full">
        <Text color="grayText">Total share of veBAL</Text>
        <HStack>
          {isLoading ? (
            <Skeleton w="40px" h="16px" />
          ) : (
            // fix: mocked
            <NumberText color="grayText">{fNum('sharePercent', 0.0546)}</NumberText>
          )}
        </HStack>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text color="grayText"> {detailed ? 'veBAL lock-up end date' : 'Lock-up end date'}</Text>
        <HStack>
          {isLoading ? (
            <Skeleton w="40px" h="16px" />
          ) : (
            <NumberText color="grayText">{lockUntilDateFormatted}</NumberText>
          )}
        </HStack>
      </HStack>
    </VStack>
  )
}
