import { Box, Flex, Text } from '@chakra-ui/react'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

type Props = {
  label: string
  amount: string
  address: string
  symbol: string
  chain: GqlChain
}

export function YouWillReceive({ label, amount, address, symbol, chain }: Props) {
  const amountFormatted = fNumCustom(amount, '0,0.[000000]')

  return (
    <Box w="full">
      <FadeInOnView>
        <Flex alignItems="flex-end" w="full">
          <Box flex="1">
            <Text color="grayText" mb="sm">
              {label}
            </Text>
            <Text fontSize="3xl">
              {amountFormatted === 'NaN' ? amount : amountFormatted} {symbol}
            </Text>
          </Box>
          <Box>
            <TokenIcon address={address} alt={symbol} chain={chain} size={40} />
          </Box>
        </Flex>
      </FadeInOnView>
    </Box>
  )
}
