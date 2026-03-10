import { Path, TokenApi } from '@balancer/sdk'
import {
  Box,
  Divider,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  VStack,
} from '@chakra-ui/react'
import { GetPoolDocument, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokens } from '../tokens/TokensProvider'
import { getTokenColor } from '@repo/lib/styles/token-colors'
import { Address } from 'viem'
import { TokenIcon } from '../tokens/TokenIcon'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { Fragment } from 'react/jsx-runtime'
import { ApiToken } from '../tokens/token.types'
import { useQuery } from '@apollo/client/react'
import { getPoolPath } from '../pool/pool.utils'
import Link from 'next/link'
import { ArrowRight } from 'react-feather'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { getCompositionTokens } from '../pool/pool-tokens.utils'
import { PoolToken } from '../pool/pool.types'
import React, { ReactElement } from 'react'
import pluralize from 'pluralize'

type RoutesPopoverProps = {
  children: ReactElement
  paths: Path[]
  chain: GqlChain
  totalInputAmount: number
  totalOutputAmount: number
  protocolVersion: number
  maxHops: number
}

export function RoutesPopover({
  children,
  paths,
  chain,
  totalInputAmount,
  totalOutputAmount,
  protocolVersion,
  maxHops,
}: RoutesPopoverProps) {
  const { getToken, priceFor } = useTokens()
  const { toCurrency } = useCurrency()

  const inputToken = getToken(paths[0].tokens[0].address, chain)!
  const outputToken = getToken(paths[0].tokens[paths[0].tokens.length - 1].address, chain)!

  const inputValue = bn(totalInputAmount).times(priceFor(inputToken.address, chain))
  const outputValue = bn(totalOutputAmount).times(priceFor(outputToken.address, chain))

  const outputPercentage = outputValue.div(inputValue).toNumber()

  const colors = fixTokenColors(chain, paths)

  return (
    <Popover placement="top" trigger="hover">
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent
        bg="background.level4"
        maxW="100vw"
        minW={{ base: '350px', md: '460px' }}
        p="0"
        rounded="lg"
        w={{ base: '350px', md: 'max-content' }}
      >
        <VStack p="4" shadow="2xl" spacing="3">
          <VStack align="start" w="full">
            <Text color="font.primary" fontSize="md" fontWeight="bold" pb="1">
              Proposed: {paths && paths.length > 1 ? `${paths.length} paths, ` : ''}
              {maxHops} {pluralize('hop', maxHops)} via Balancer v{protocolVersion}
            </Text>
          </VStack>

          <Divider mb="2" mt="0" mx="-4" w="calc(100% + 2rem)" />

          <HStack justify="space-between" w="full">
            <HStack>
              <Text fontSize="sm" fontWeight="bold" letterSpacing="normal">
                {`${fNum('token', totalInputAmount)} ${inputToken.symbol}`}
              </Text>
              <Text>
                <ArrowRight size="16" />
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold" letterSpacing="normal">
              {`${fNum('token', totalOutputAmount)} ${outputToken.symbol}`}
            </Text>
          </HStack>

          <HStack gap="1" h="200" overflowX="auto" w="full">
            <TokenItem
              amountShare={1}
              chain={chain}
              colors={colors}
              position="start"
              token={inputToken}
              tokenAmount={totalInputAmount}
            />

            <VStack flex="1" gap="1" h="full">
              {paths.map((path, i) => (
                <PathRoute
                  chain={chain}
                  colors={colors}
                  key={`path-${i}`}
                  path={path}
                  totalAmount={totalInputAmount}
                />
              ))}
            </VStack>

            <TokenItem
              amountShare={outputPercentage}
              chain={chain}
              colors={colors}
              position="end"
              token={outputToken}
              tokenAmount={totalOutputAmount}
            />
          </HStack>

          <HStack justify="space-between" w="full">
            <HStack>
              <Text color="font.secondary" fontSize="sm">
                {toCurrency(inputValue)}
              </Text>
              <Text color="font.secondary">
                <ArrowRight size="16" />
              </Text>
            </HStack>
            <Text color="font.secondary" fontSize="sm">
              {`${toCurrency(outputValue)} (${fNum('sharePercent', -(1 - outputPercentage), { hideSmallPercentage: false })})`}
            </Text>
          </HStack>
        </VStack>
      </PopoverContent>
    </Popover>
  )
}

type Props = {
  paths: Path[] | undefined
  chain: GqlChain
  totalInputAmount: number
  totalOutputAmount: number
  protocolVersion: number
}

export function RoutesCard({
  paths,
  chain,
  totalInputAmount,
  totalOutputAmount,
  protocolVersion,
}: Props) {
  if (!paths || paths.length === 0) return null

  const maxHops = paths?.reduce((acc, path) => {
    return acc + (path.isBuffer || []).filter(buffer => buffer === false).length
  }, 0)

  return (
    <Box pt="4" w="full">
      <RoutesPopover
        chain={chain}
        maxHops={maxHops}
        paths={paths}
        protocolVersion={protocolVersion}
        totalInputAmount={totalInputAmount}
        totalOutputAmount={totalOutputAmount}
      >
        <HStack
          _expanded={{ color: 'font.link', '& .arrow-icon': { transform: 'rotate(-45deg)' } }}
          _hover={{ color: 'font.link', '& .arrow-icon': { transform: 'rotate(-45deg)' } }}
          color="font.secondary"
          cursor="pointer"
          data-group
          gap="1"
        >
          <Text
            _after={{
              borderBottom: '1px dotted',
              borderColor: 'currentColor',
              bottom: '-2px',
              content: '""',
              left: 0,
              opacity: 0.5,
              position: 'absolute',
              width: '100%',
            }}
            _groupHover={{
              color: 'font.link',
            }}
            color="font.secondary"
            fontSize="sm"
            position="relative"
            transition="color 0.2s"
          >
            Swap route: {paths && paths.length > 1 ? `${paths.length} paths, ` : ''}
            {maxHops} {pluralize('hop', maxHops)} (Bv{protocolVersion})
          </Text>
          <Box as="span" className="arrow-icon" display="flex" transition="transform 0.2s">
            <ArrowRight size="12" />
          </Box>
        </HStack>
      </RoutesPopover>
    </Box>
  )
}

type PathRouteProps = {
  chain: GqlChain
  path: Path
  totalAmount: number
  colors: Record<string, string>
}

function PathRoute({ chain, path, totalAmount, colors }: PathRouteProps) {
  const amountShare = bn(path.inputAmountRaw)
    .shiftedBy(-path.tokens[0].decimals)
    .div(totalAmount)
    .toNumber()
  const { getToken } = useTokens()

  return (
    <HStack gap="1" height={`${amountShare * 100}%`} w="full">
      {path.pools.map((pool, i) => {
        const isBuffer = !path.isBuffer || path.isBuffer[i] === true

        const inputTokenInfo = getToken(path.tokens[i].address, chain)!
        const outputTokenInfo = getToken(path.tokens[i + 1].address, chain)!

        const hops = path.isBuffer?.filter(buffer => !buffer).length || 0

        return (
          <Fragment key={`hop-${pool}`}>
            {!isBuffer && (
              <PoolItem
                amountShare={amountShare}
                chain={chain}
                colors={colors}
                hops={hops}
                inputToken={inputTokenInfo}
                outputToken={outputTokenInfo}
                poolId={pool}
              />
            )}

            {i < path.pools.length - 1 && !isBuffer && (
              <TokenItem
                amountShare={amountShare}
                chain={chain}
                colors={colors}
                position="middle"
                token={outputTokenInfo}
              />
            )}
          </Fragment>
        )
      })}
    </HStack>
  )
}

type TokenItemProps = {
  chain: GqlChain
  token: ApiToken
  position: 'start' | 'middle' | 'end'
  amountShare: number
  colors: Record<string, string>
  tokenAmount?: number
}

function TokenItem({ chain, token, position, amountShare, colors, tokenAmount }: TokenItemProps) {
  const { toCurrency } = useCurrency()
  const { priceFor } = useTokens()

  const borderProps = {
    borderLeftRadius: position === 'start' ? '10px' : undefined,
    borderRightRadius: position === 'end' ? '10px' : undefined,
  }

  const item = (
    <Box
      alignItems="center"
      bgColor={colors[token.address]}
      display="flex"
      height="100%"
      justifyContent="center"
      px="1"
      w="44px"
      {...borderProps}
    >
      <Box borderRadius="full" boxShadow="xl">
        <TokenIcon address={token.address} alt={token.symbol} chain={token.chain} size={32} />
      </Box>
    </Box>
  )

  return !tokenAmount ? (
    item
  ) : (
    <Popover trigger="hover">
      <PopoverTrigger>{item}</PopoverTrigger>
      <PopoverContent p="2" width="fit-content">
        <VStack alignItems="flex-start">
          <Text fontSize="lg" fontWeight="bold">
            {fNum('sharePercent', amountShare)}
          </Text>
          <Text fontSize="sm" fontWeight="bold">
            {`${tokenAmount} ${token.symbol}`}
          </Text>
          {tokenAmount && (
            <Text color="font.secondary" fontSize="sm">
              {toCurrency(priceFor(token.address, chain) * tokenAmount)}
            </Text>
          )}
        </VStack>
      </PopoverContent>
    </Popover>
  )
}

type PoolItemProps = {
  chain: GqlChain
  poolId: string
  inputToken: ApiToken
  outputToken: ApiToken
  amountShare: number
  hops: number
  colors: Record<string, string>
}

function PoolItem({
  chain,
  poolId,
  inputToken,
  outputToken,
  amountShare,
  hops,
  colors,
}: PoolItemProps) {
  const { data } = useQuery(GetPoolDocument, {
    variables: { id: poolId, chain },
  })

  if (!data) return null

  const tokens = sortTokens(getCompositionTokens(data.pool), inputToken, outputToken)
  const poolName = data.pool.name

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <Box
          alignItems="center"
          bgGradient={`linear(to-r, ${colors[inputToken.address]}, ${colors[outputToken.address]})`}
          display="flex"
          flex="1"
          h="full"
          justifyContent="center"
          px="1"
        >
          <HStack
            bgColor="whiteAlpha.500"
            border="1px"
            borderColor="whiteAlpha.500"
            borderRadius="20px"
            p="1"
          >
            {tokens.map(token => (
              <TokenIcon
                address={token.address}
                alt={token.symbol}
                chain={chain}
                key={token.address}
                size={hops > 2 ? 16 : 24}
              />
            ))}
          </HStack>
        </Box>
      </PopoverTrigger>
      <PopoverContent p="2" width="fit-content">
        <VStack alignItems="flex-start">
          <Text fontSize="lg" fontWeight="bold">
            {fNum('sharePercent', amountShare)}
          </Text>
          <Link className="group" href={getPoolPath(data.pool)}>
            <HStack _hover={{ textDecoration: 'underline' }} cursor="pointer" gap="1">
              <Text color="font.secondary" fontSize="sm">
                {poolName}
              </Text>
              <ArrowRight color="grey" size="14" />
            </HStack>
          </Link>
        </VStack>
      </PopoverContent>
    </Popover>
  )
}

function fixTokenColors(chain: GqlChain, paths: Path[]) {
  const tokens = paths.reduce((tokens, path) => {
    tokens.push(...path.tokens)
    return tokens
  }, [] as TokenApi[])

  return tokens.reduce(
    (colors, token) => {
      colors[token.address] = getTokenColor(chain, token.address as Address).from
      return colors
    },
    {} as Record<string, string>
  )
}

function sortTokens(tokens: PoolToken[], inputToken: ApiToken, outputToken: ApiToken) {
  const inputIndex = tokens.findIndex(token => token.address === inputToken.address)
  if (inputIndex === -1) return tokens
  ;[tokens[0], tokens[inputIndex]] = [tokens[inputIndex], tokens[0]]

  const outputIndex = tokens.findIndex(token => token.address === outputToken.address)
  if (outputIndex === -1) return tokens
  ;[tokens[tokens.length - 1], tokens[outputIndex]] = [
    tokens[outputIndex],
    tokens[tokens.length - 1],
  ]

  return tokens
}
