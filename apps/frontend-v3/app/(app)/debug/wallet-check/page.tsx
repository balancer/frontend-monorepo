'use client'

import { Box, Button, Code, Input, VStack } from '@chakra-ui/react'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

export default function Page() {
  const [address, setAddress] = useState('')
  const [data, setData] = useState('')

  async function checkWallet() {
    const res = await fetch(`/api/wallet-check/${address}`)
    const data = await res.json()
    setData(data)
    console.log(data)
  }

  return (
    <VStack>
      <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." />
      <Button onClick={checkWallet}>Check wallet address</Button>
      <Box>
        <Code>{JSON.stringify(data, null, 2)}</Code>
      </Box>
    </VStack>
  )
}
