import { Path, TokenApi } from '@balancer/sdk'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
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

type Props = {
  paths: Path[] | undefined
  chain: GqlChain
  totalInputAmount: number
  totalOutputAmount: number
}

export function RoutesCard({ paths, chain, totalInputAmount, totalOutputAmount }: Props) {
  const { getToken, priceFor } = useTokens()
  const { toCurrency } = useCurrency()

  if (!paths || paths.length === 0) return null

  const maxHops = paths?.reduce((acc, path) => {
    return acc + (path.isBuffer || []).filter(buffer => buffer === false).length
  }, 0)
  const inputToken = getToken(paths[0].tokens[0].address, chain)!
  const outputToken = getToken(paths[0].tokens[paths[0].tokens.length - 1].address, chain)!

  const inputValue = bn(totalInputAmount).times(priceFor(inputToken.address, chain))
  const outputValue = bn(totalOutputAmount).times(priceFor(outputToken.address, chain))

  const outputPercentage = outputValue.div(inputValue).toNumber()

  const colors = fixTokenColors(chain, paths)

  return (
    <Box w="full">
      <Accordion allowToggle variant="button" w="full">
        <AccordionItem
          bg="background.level3"
          border="1px solid"
          borderColor="transparent"
          borderRadius="md"
          shadow="md"
          w="full"
        >
          <AccordionButton pl="ms" pr="sm">
            <Box as="span" flex="1" textAlign="left">
              {`Proposed route: ${paths?.length > 1 ? 'Split route, ' : ''} ${maxHops} hops`}
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel w="full">
            <VStack>
              <HStack justify="space-between" w="full">
                <HStack>
                  <Text fontSize="sm" fontWeight="bold">
                    {`${fNum('token', totalInputAmount)} ${inputToken.symbol}`}
                  </Text>
                  <Text>
                    <ArrowRight size="16" />
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold">
                  {`${fNum('token', totalOutputAmount)} ${outputToken.symbol}`}
                </Text>
              </HStack>

              <HStack h="200" overflowX="auto" pb="2" w="full">
                <TokenItem
                  amountShare={1}
                  chain={chain}
                  colors={colors}
                  position="start"
                  token={inputToken}
                  tokenAmount={totalInputAmount}
                />

                <VStack flex="1" h="full">
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
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
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
    <HStack height={`${amountShare * 100}%`} w="full">
      {path.pools.map((pool, i) => {
        const isBuffer = !path.isBuffer || path.isBuffer[i] === true

        const inputTokenInfo = getToken(path.tokens[i].address, chain)!
        const outputTokenInfo = getToken(path.tokens[i + 1].address, chain)!
        const outputTokenIsWrapper = outputTokenInfo?.priceRateProviderData !== null

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

            {i < path.pools.length - 1 && !outputTokenIsWrapper && (
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
      w="48px"
      {...borderProps}
    >
      <Box borderRadius="full" boxShadow="xl">
        <TokenIcon address={token.address} alt={token.symbol} chain={token.chain} size={36} />
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
            <HStack _hover={{ textDecoration: 'underline' }} cursor="pointer">
              <Text fontSize="sm" fontWeight="bold">
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
  ;[tokens[0], tokens[inputIndex]] = [tokens[inputIndex], tokens[0]]

  const outputIndex = tokens.findIndex(token => token.address === outputToken.address)
  ;[tokens[tokens.length - 1], tokens[outputIndex]] = [
    tokens[outputIndex],
    tokens[tokens.length - 1],
  ]

  return tokens
}
