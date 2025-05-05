import TokenRow, { TokenRowProps } from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { ReactNode } from 'react'
import { Divider, HStack, VStack } from '@chakra-ui/react'

export interface TokenRowWithDetailsProps extends TokenRowProps {
  details?: [ReactNode, ReactNode][]
}

export function TokenRowWithDetails({ details, ...props }: TokenRowWithDetailsProps) {
  return (
    <VStack alignItems="start">
      <TokenRow {...props} />
      {details && details.length > 0 && (
        <>
          <Divider mb="sm" ml="-4" mt="sm" width="calc(100% + 2 * var(--chakra-space-4))" />

          {details.map(([left, right], index) => (
            // eslint-disable-next-line react/no-array-index-key
            <HStack justifyContent="space-between" key={`detail#${index}`} w="full">
              {left}
              {right}
            </HStack>
          ))}
        </>
      )}
    </VStack>
  )
}
