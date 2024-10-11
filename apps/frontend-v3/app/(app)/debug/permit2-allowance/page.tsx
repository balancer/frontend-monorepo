/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client'

import { getGqlChain, getNetworkConfig } from '@/lib/config/app.config'
import { BPT_DECIMALS } from '@/lib/modules/pool/pool.constants'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { permit2Abi } from '@balancer/sdk'
import { Center, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Address, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { useReadContract } from 'wagmi'

export default function Page() {
  const [tokenAddress, setTokenAddress] = useState<Address>('' as Address)

  const { chain, userAddress } = useUserAccount()

  const chainId = chain?.id || sepolia.id

  const { data } = usePermit2Allowance({ chainId, tokenAddress, owner: userAddress })

  return (
    <Center>
      <VStack w="50%">
        <Text>
          Enter address of token to check permit2 allowance in the current chain:{' '}
          {chain ? chain.name : 'None'}
        </Text>
        <Input type="text" onChange={e => setTokenAddress(e.target.value as Address)} />

        {data && (
          <div>
            <div>Amount: {formatUnits(data[0], BPT_DECIMALS).toString()}</div>
            <div>Expires: {data[1]}</div>
            <div>Nonce: {data[2]}</div>
          </div>
        )}
      </VStack>
    </Center>
  )
}

type Params = {
  chainId: number
  tokenAddress: Address
  owner: Address
}
function usePermit2Allowance({ chainId, tokenAddress, owner }: Params) {
  const permit2Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'
  const balancerRouter = getNetworkConfig(getGqlChain(chainId)).contracts.balancer.router!
  const spender = balancerRouter

  return useReadContract({
    chainId,
    address: permit2Address,
    abi: permit2Abi,
    functionName: 'allowance',
    args: [owner, tokenAddress, spender],
    query: {
      enabled: !!tokenAddress && !!owner,
    },
  })
}
