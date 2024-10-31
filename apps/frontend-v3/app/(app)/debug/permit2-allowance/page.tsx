/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client'

import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { Center, HStack, Input, Radio, RadioGroup, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Address, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { useDebugPermit2Allowance } from '@repo/lib/shared/hooks/debug.hooks'
import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'

type RouterOption = 'BALANCER_ROUTER' | 'BALANCER_BATCH_ROUTER'

export default function Page() {
  const [tokenAddress, setTokenAddress] = useState<Address>('' as Address)
  const [router, setRouter] = useState<Address>('' as Address)

  const { chain, userAddress } = useUserAccount()
  const chainId = chain?.id || sepolia.id
  const balancerRouter = getNetworkConfig(getGqlChain(chainId)).contracts.balancer.balancerRouter!
  const balancerBatchRouter = getNetworkConfig(getGqlChain(chainId)).contracts.balancer
    .balancerBatchRouter!

  function onRouterChange(option: RouterOption) {
    if (option === 'BALANCER_ROUTER') setRouter(balancerRouter)
    if (option === 'BALANCER_BATCH_ROUTER') setRouter(balancerBatchRouter)
  }

  const { data } = useDebugPermit2Allowance({
    chainId,
    tokenAddress,
    owner: userAddress,
    spender: router,
  })

  return (
    <Center>
      <VStack w="50%">
        <RadioGroup onChange={onRouterChange} value={undefined}>
          <VStack w="full">
            <HStack w="full">
              <Radio value="BALANCER_ROUTER" /> <Text> BALANCER ROUTER </Text>
              <Radio value="BALANCER_BATCH_ROUTER" /> <Text> BALANCER BATCH ROUTER </Text>
            </HStack>
            )
          </VStack>
        </RadioGroup>
        <Text>
          Enter address of token to check permit2 allowance in the current chain:{' '}
          {chain ? chain.name : 'None'}
        </Text>
        <Input onChange={e => setTokenAddress(e.target.value as Address)} type="text" />

        {data ? (
          <div>
            <div>Amount: {formatUnits(data[0], BPT_DECIMALS).toString()}</div>
            <div>Expires: {data[1]}</div>
            <div>Nonce: {data[2]}</div>
          </div>
        ) : null}
      </VStack>
    </Center>
  )
}
