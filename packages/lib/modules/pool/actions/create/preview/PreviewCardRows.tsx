import {
  VStack,
  Text,
  SimpleGrid,
  Heading,
  Divider,
  CardHeader,
  Box,
  HStack,
} from '@chakra-ui/react'
import { ReactNode } from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { TokenInfoPopover } from '@repo/lib/modules/tokens/TokenInfoPopover'

export function CardHeaderRow({ columnNames }: { columnNames: string[] }) {
  return (
    <CardHeader>
      <VStack align="start" w="full">
        <SimpleGrid alignItems="baseline" columns={4} pb="1.5" spacing={5} w="full">
          <Heading gridColumn="span 2" size="md">
            {columnNames[0]}
          </Heading>

          {columnNames.slice(1).map(name => (
            <Text color="font.secondary" fontSize="sm" key={name} textAlign="right">
              {name}
            </Text>
          ))}
        </SimpleGrid>
        <Divider />
      </VStack>
    </CardHeader>
  )
}

export function CardDataRow({ data }: { data: ReactNode[] }) {
  return (
    <SimpleGrid alignItems="center" columns={4} spacing={5} w="full">
      {data.map((item, index) => (
        <Box
          gridColumn={index === 0 ? 'span 2' : ''}
          key={index}
          textAlign={index === 0 ? 'left' : 'right'}
        >
          {item}
        </Box>
      ))}
    </SimpleGrid>
  )
}

export function IdentifyTokenCell({
  address,
  chain,
  symbol,
  name,
}: {
  address: string
  chain: GqlChain
  symbol: string
  name?: string
}) {
  return (
    <HStack gap="3">
      <TokenIcon address={address} alt={address || ''} chain={chain} size={36} />
      <VStack align="start" spacing="0">
        <HStack spacing="xs">
          <Text fontWeight="semibold">{symbol}</Text>
          <Box onClick={e => e.stopPropagation()} zIndex={100}>
            <TokenInfoPopover chain={chain} tokenAddress={address} />
          </Box>
        </HStack>
        <Text color="font.secondary" fontSize="sm">
          {name}
        </Text>
      </VStack>
    </HStack>
  )
}

export function DefaultDataRow() {
  return (
    <CardDataRow
      data={[<Text>—</Text>, <Text align="right">—</Text>, <Text align="right">—</Text>]}
    />
  )
}
