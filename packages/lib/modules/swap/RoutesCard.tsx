import { Path } from '@balancer/sdk'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTokens } from '../tokens/TokensProvider'
import { getTokenColor } from '@repo/lib/styles/token-colors'
import { Address, zeroAddress } from 'viem'
import { TokenIcon } from '../tokens/TokenIcon'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Fragment } from 'react/jsx-runtime'

type Props = {
  paths: Path[] | undefined
  chain: GqlChain
}

export function RoutesCard({ paths, chain }: Props) {
  const { getToken } = useTokens()

  // FIXME: [JUANJO] Hide in case of single pool swap???
  if (!paths || paths.length === 0) return null

  const maxHops = paths?.reduce((acc, path) => {
    return acc + (path.isBuffer || []).filter(buffer => buffer === false).length
  }, 0)
  const totalAmount = paths?.reduce((acc, path) => acc + path.inputAmountRaw, 0n)
  const inputToken = getToken(paths[0].tokens[0].address, chain)!
  const outputToken = getToken(paths[0].tokens[paths[0].tokens.length - 1].address, chain)!

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
              {`Proposed route: ${paths?.length} split(s), ${maxHops} hops`}
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel h="200" w="full">
            <HStack h="full" w="full">
              <Box
                alignItems="center"
                bgColor={getTokenColor(chain, inputToken.address as Address).from}
                borderLeftRadius="10px"
                display="flex"
                height="100%"
                justifyContent="center"
                w="48px"
              >
                <Box borderRadius="full" boxShadow="xl">
                  <TokenIcon
                    address={inputToken.address}
                    alt={inputToken.symbol}
                    chain={inputToken.chain}
                    size={36}
                  />
                </Box>
              </Box>

              <VStack flex="1" h="full">
                {paths.map((path, i) => (
                  <PathRoute
                    chain={chain}
                    key={`path-${i}`}
                    path={path}
                    totalAmount={totalAmount}
                  />
                ))}
              </VStack>

              <Box
                alignItems="center"
                bgColor={getTokenColor(chain, outputToken.address as Address).from}
                borderRightRadius="10px"
                display="flex"
                height="100%"
                justifyContent="center"
                w="48px"
              >
                <Box borderRadius="full" boxShadow="xl">
                  <TokenIcon
                    address={outputToken.address}
                    alt={outputToken.symbol}
                    chain={outputToken.chain}
                    size={36}
                  />
                </Box>
              </Box>
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}

type PathRouteProps = {
  chain: GqlChain
  path: Path
  totalAmount: bigint
}

function PathRoute({ chain, path, totalAmount }: PathRouteProps) {
  const amountPercentage = bn(path.inputAmountRaw).div(totalAmount).times(100).toNumber()
  const { getToken } = useTokens()

  return (
    <HStack height={`${amountPercentage}%`} w="full">
      {path.pools.map((pool, i) => {
        const isBuffer = !path.isBuffer || path.isBuffer[i] === true

        const inputTokenInfo = getToken(path.tokens[i].address, chain)!
        const inputTokenColor = getTokenColor(chain, inputTokenInfo.address as Address).from
        const outputTokenInfo = getToken(path.tokens[i + 1].address, chain)!
        const outputTokenColor = getTokenColor(chain, outputTokenInfo.address as Address).from
        const outputTokenIsWrapper = outputTokenInfo?.priceRateProviderData !== null

        return (
          <Fragment key={`hop-${pool}`}>
            {!isBuffer && (
              <Box
                alignItems="center"
                bgGradient={`linear(to-r, ${inputTokenColor}, ${outputTokenColor})`}
                display="flex"
                flex="1"
                h="full"
                justifyContent="center"
              >
                <HStack
                  bgColor="whiteAlpha.500"
                  border="1px"
                  borderColor="whiteAlpha.500"
                  borderRadius="20px"
                  p="1"
                >
                  <TokenIcon
                    address={inputTokenInfo.address}
                    alt={inputTokenInfo?.symbol || ''}
                    chain={inputTokenInfo?.chain || zeroAddress}
                    size={24}
                  />
                  <TokenIcon
                    address={outputTokenInfo.address}
                    alt={outputTokenInfo?.symbol || ''}
                    chain={outputTokenInfo?.chain || zeroAddress}
                    size={24}
                  />
                </HStack>
              </Box>
            )}

            {i < path.pools.length - 1 && !outputTokenIsWrapper && (
              <Box
                alignItems="center"
                bgColor={outputTokenColor}
                display="flex"
                height="100%"
                justifyContent="center"
                w="48px"
              >
                <Box borderRadius="full" boxShadow="xl">
                  <TokenIcon
                    address={outputTokenInfo.address}
                    alt={outputTokenInfo?.symbol || ''}
                    border="1px"
                    chain={outputTokenInfo?.chain || zeroAddress}
                    size={36}
                  />
                </Box>
              </Box>
            )}
          </Fragment>
        )
      })}
    </HStack>
  )
}
