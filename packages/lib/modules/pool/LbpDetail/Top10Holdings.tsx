import { Card, HStack, Spacer, Text, VStack } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { EnsOrAddress } from '../../user/EnsOrAddress'

type Holder = {
  address: Address
  percentage: number
}

export function Top10Holdings({ chain }: { chain: GqlChain }) {
  const holders: Holder[] = [
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc6',
      percentage: 30,
    },
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc7',
      percentage: 20,
    },
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc8',
      percentage: 10,
    },
    {
      address: '0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2',
      percentage: 5,
    },
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc9',
      percentage: 3,
    },
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc2',
      percentage: 1,
    },
    {
      address: '0xeB0Cda1a52f9ac0bD5293bd65b52eD07168e1E8e',
      percentage: 1,
    },
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc3',
      percentage: 1,
    },
    {
      address: '0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc4',
      percentage: 1,
    },
    {
      address: '0x9cC56Fa7734DA21aC88F6a816aF10C5b898596Ce',
      percentage: 1,
    },
  ]

  const sum = holders.reduce((acc, holder) => acc + holder.percentage, 0)

  return (
    <Card>
      <VStack w="full" spacing="5">
        <HStack w="full">
          <Text fontWeight="bold" fontSize="lg">
            Top 10 holdings at sale end
          </Text>
          <Spacer />
          <Text fontWeight="bold" fontSize="lg">{`${sum.toFixed(2)}%`}</Text>
        </HStack>
        <VStack w="full">
          {holders.map(holder => (
            <Row key={holder.address} holder={holder} chain={chain} />
          ))}
        </VStack>
      </VStack>
    </Card>
  )
}

export function Row({ holder, chain }: { holder: Holder; chain: GqlChain }) {
  return (
    <HStack w="full">
      <EnsOrAddress userAddress={holder.address} chain={chain} />
      <Spacer />
      <Text fontSize="md">{`${holder.percentage.toFixed(2)}%`}</Text>
    </HStack>
  )
}
