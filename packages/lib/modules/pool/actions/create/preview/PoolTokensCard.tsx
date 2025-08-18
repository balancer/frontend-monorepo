import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import {
  VStack,
  Heading,
  Card,
  CardHeader,
  HStack,
  Text,
  CardBody,
  Divider,
  Box,
  SimpleGrid,
} from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

export function PoolTokensCard() {
  const {
    poolConfigForm: { watch },
  } = usePoolCreationForm()
  const { poolTokens } = watch()

  const { usdValueForTokenAddress } = useTokens()
  const { toCurrency } = useCurrency()

  return (
    <Card>
      <CardHeader>
        <SimpleGrid columns={4} spacing={5}>
          <Heading gridColumn="span 2" size="md">
            Tokens
          </Heading>
          <Text align="right" color="font.secondary" fontSize="sm">
            Price
          </Text>
          <Text align="right" color="font.secondary" fontSize="sm">
            Market Cap
          </Text>
        </SimpleGrid>
      </CardHeader>
      <Divider mb="md" />
      <CardBody>
        <VStack spacing="md">
          {poolTokens.map((token, index) => {
            const { data } = token
            if (!data) return null

            const { address, chain, symbol, name } = data

            return (
              <SimpleGrid alignItems="center" columns={4} key={address} spacing={5} w="full">
                <Box gridColumn="span 2" key={index} w="full">
                  <HStack gap="3">
                    <TokenIcon address={address} alt={address || ''} chain={chain} size={36} />
                    <VStack align="start" spacing="0">
                      <Text>{symbol}</Text>
                      <Text color="font.secondary">{name}</Text>
                    </VStack>
                  </HStack>
                </Box>
                <Text align="right">
                  {toCurrency(usdValueForTokenAddress(address, chain, '1'), { abbreviated: false })}
                </Text>
                <Text align="right">???</Text>
              </SimpleGrid>
            )
          })}
        </VStack>
      </CardBody>
    </Card>
  )
}
