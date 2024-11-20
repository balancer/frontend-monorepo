'use client'

import { Box, BoxProps, Center, Text } from '@chakra-ui/react'
import { GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Virtuoso } from 'react-virtuoso'
import { useTokenBalances } from '../../TokenBalancesProvider'
import { TokenSelectListRow } from './TokenSelectListRow'

type Props = {
  tokens: GqlToken[]
  onTokenSelect: (token: GqlToken) => void
}

export function CompactTokenSelectList({ tokens, onTokenSelect, ...rest }: Props & BoxProps) {
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

  const style = { height: `${tokens.length * 75}px` }

  function renderRow(index: number) {
    const token = tokens[index]
    const userBalance = isConnected ? balanceFor(token) : undefined

    return (
      <TokenSelectListRow
        active={index === activeIndex}
        isBalancesLoading={isBalancesLoading}
        key={keyFor(token, index)}
        onClick={() => onTokenSelect(token)}
        token={token}
        userBalance={userBalance}
      />
    )
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
        <Virtuoso data={tokens} itemContent={renderRow} style={style} />
      )}
    </Box>
  )
}
