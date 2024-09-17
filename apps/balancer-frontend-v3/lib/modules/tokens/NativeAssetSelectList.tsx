'use client'

import { Box, BoxProps, Center, Text } from '@chakra-ui/react'
import { TokenSelectListRow } from './TokenSelectModal/TokenSelectList/TokenSelectListRow'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useTokenBalances } from './TokenBalancesProvider'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Virtuoso } from 'react-virtuoso'

type Props = {
  tokens: GqlToken[]
  onTokenSelect: (token: GqlToken) => void
}

export function NativeAssetSelectList({ tokens, onTokenSelect, ...rest }: Props & BoxProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { isConnected } = useUserAccount()

  const decrementActiveIndex = () => setActiveIndex(prev => Math.max(prev - 1, 0))
  const incrementActiveIndex = () => setActiveIndex(prev => Math.min(prev + 1, tokens.length - 1))
  const hotkeyOpts = { enableOnFormTags: true }

  const selectActiveToken = () => {
    const token = tokens[activeIndex]
    if (token) {
      onTokenSelect(token)
    }
  }

  useHotkeys('up', decrementActiveIndex, hotkeyOpts)
  useHotkeys('shift+tab', decrementActiveIndex, hotkeyOpts)
  useHotkeys('down', incrementActiveIndex, hotkeyOpts)
  useHotkeys('tab', incrementActiveIndex, hotkeyOpts)
  useHotkeys('enter', selectActiveToken, [tokens, activeIndex], hotkeyOpts)

  function keyFor(token: GqlToken, index: number) {
    return `${token.address}:${token.chain}:${index}`
  }

  return (
    <Box {...rest}>
      {tokens.length === 0 ? (
        <Center h="60">
          <Text color="gray.500" fontSize="sm">
            No tokens found
          </Text>
        </Center>
      ) : (
        <Virtuoso
          style={{ height: '150px' }}
          data={tokens}
          itemContent={index => {
            const token = tokens[index]
            const userBalance = isConnected ? balanceFor(token) : undefined

            return (
              <TokenSelectListRow
                key={keyFor(token, index)}
                active={index === activeIndex}
                onClick={() => onTokenSelect(token)}
                token={token}
                userBalance={userBalance}
                isBalancesLoading={isBalancesLoading}
              />
            )
          }}
        />
      )}
    </Box>
  )
}
