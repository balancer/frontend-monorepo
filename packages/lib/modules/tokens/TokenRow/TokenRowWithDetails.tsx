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

          <HStack justifyContent="space-between" w="full">
            {details.map(([left, right]) => (
              <>
                {left}
                {right}
              </>
            ))}
          </HStack>
        </>
      )}
    </VStack>
  )
}
