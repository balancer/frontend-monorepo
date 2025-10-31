import { Box, Flex, Text, Popover, PopoverContent, PopoverTrigger, HStack } from '@chakra-ui/react'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'

type Props = {
  label: string
  amount: string
  address: string
  symbol: string
  chain: GqlChain
  infoText?: string
}

export function YouWillReceive({ label, amount, address, symbol, chain, infoText }: Props) {
  const amountFormatted = fNumCustom(amount, '0,0.[000000]')

  return (
    <Box w="full">
      <FadeInOnView>
        <Flex alignItems="flex-end" w="full">
          <Box flex="1">
            {infoText ? (
              <HStack alignItems="center" mb="sm">
                <Text color="grayText" mb="0">
                  {label}
                </Text>
                <Popover placement="right" trigger="hover">
                  <PopoverTrigger>
                    <Box
                      _hover={{ opacity: 1 }}
                      opacity="0.5"
                      transition="opacity 0.2s var(--ease-out-cubic)"
                    >
                      <InfoIcon />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent p="sm">
                    <Text fontSize="sm" variant="secondary">
                      {infoText}
                    </Text>
                  </PopoverContent>
                </Popover>
              </HStack>
            ) : (
              <Text color="grayText" mb="sm">
                {label}
              </Text>
            )}
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
