'use client'

import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { Center, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Address, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { useDebugPermit2Allowance } from '@repo/lib/shared/hooks/debug.hooks'

export default function Page() {
  const [tokenAddress, setTokenAddress] = useState<Address>('' as Address)

  const { chain, userAddress } = useUserAccount()

  const chainId = chain?.id || sepolia.id

  const { data } = useDebugPermit2Allowance({ chainId, tokenAddress, owner: userAddress })

  return (
    <Center>
      <VStack w="50%">
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
