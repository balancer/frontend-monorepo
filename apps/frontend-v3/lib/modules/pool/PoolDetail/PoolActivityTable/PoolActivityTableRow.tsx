import {
  Box,
  Grid,
  GridItem,
  GridProps,
  HStack,
  Text,
  Image,
  Link,
  useTheme,
  Badge,
  BadgeProps,
} from '@chakra-ui/react'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns'
import { abbreviateAddress } from '@/lib/shared/utils/addresses'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { getChainId } from '@/lib/config/app.config'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { ArrowUpRight } from 'react-feather'
import {
  getBlockExplorerAddressUrl,
  getBlockExplorerTxUrl,
} from '@/lib/shared/hooks/useBlockExplorer'
import { PoolActivityEl, PoolActivityTokens } from '../PoolActivity/poolActivity.types'
import { TokenIcon } from '@/lib/modules/tokens/TokenIcon'
import { fNum } from '@/lib/shared/utils/numbers'
import React from 'react'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { usePool } from '../../PoolProvider'

interface Props extends GridProps {
  event: PoolActivityEl
  keyValue: number
}

function EnsOrAddress({ userAddress, chain }: { userAddress: `0x${string}`; chain: GqlChain }) {
  const chainId = getChainId(GqlChain.Mainnet) // perform ENS lookup through mainnet
  const { data: name } = useEnsName({ address: userAddress, chainId })

  const { data: ensAvatar } = useEnsAvatar({
    name: name as string,
    chainId,
  })

  const fallbackSVG = createAvatar(identicon, {
    seed: userAddress || 'unknown',
  })

  return (
    <Link target="_blank" href={getBlockExplorerAddressUrl(userAddress, chain)}>
      <HStack>
        <Image
          src={ensAvatar || fallbackSVG.toDataUriSync()}
          alt={name || userAddress}
          width="24px"
          height="24px"
          borderRadius="100%"
          backgroundColor="background.level4"
        />
        <HStack gap="0.5">
          <Text>{name || abbreviateAddress(userAddress)}</Text>
          <Text variant="secondary">
            <ArrowUpRight size={12} />
          </Text>
        </HStack>
      </HStack>
    </Link>
  )
}

function TransactionDetails({
  action,
  tokens,
  ...badgeProps
}: {
  action: 'swap' | 'add' | 'remove'
  tokens: PoolActivityTokens[]
} & BadgeProps) {
  const tokensWithAmount = tokens.filter(token => token.amount !== '0')

  return (
    <HStack wrap="wrap">
      {tokensWithAmount.map((token, index) => {
        return (
          <React.Fragment key={index}>
            <Badge
              {...badgeProps}
              display="flex"
              alignItems="center"
              bg="background.level3"
              borderRadius="full"
              textTransform="none"
            >
              <HStack gap={['xs', 'sm']}>
                <TokenIcon
                  chain={token.token?.chain}
                  address={token.token?.address}
                  size={24}
                  alt={token.token?.symbol || ''}
                />
                <Text>{fNum('token', token.amount)}</Text>
              </HStack>
            </Badge>
            {tokensWithAmount.length > 1 && tokensWithAmount.length - 1 > index && (
              <Text>{action === 'swap' ? '→' : '+'}</Text>
            )}
          </React.Fragment>
        )
      })}
    </HStack>
  )
}

export function PoolActivityTableRow({ event, keyValue, ...rest }: Props) {
  const { toCurrency } = useCurrency()
  const theme = useTheme()
  const { chain } = usePool()

  const poolEvent = event[2]

  return (
    <FadeInOnView>
      <Box
        key={keyValue}
        transition="all 0.2s ease-in-out"
        _hover={{
          bg: 'background.level0',
        }}
        rounded="md"
        px={{ base: '0', sm: 'md' }}
        w="full"
      >
        <Grid {...rest} py={{ base: 'ms', md: 'md' }} pr="4">
          <GridItem>
            <EnsOrAddress userAddress={poolEvent.userAddress as `0x${string}`} chain={chain} />
          </GridItem>
          <GridItem>
            <HStack>
              <Box
                height="2"
                width="2"
                backgroundImage={
                  theme.semanticTokens.colors.chart.pool.scatter[poolEvent.action].label
                }
                borderRadius="50%"
                display="inline-block"
              />
              <Text casing="capitalize">{poolEvent.action}</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <TransactionDetails
              action={poolEvent.action}
              tokens={poolEvent.tokens}
              py="2"
              px="sm"
            />
          </GridItem>
          <GridItem textAlign="right">
            <Text>{toCurrency(poolEvent.usdValue)}</Text>
          </GridItem>
          <GridItem>
            <Link target="_blank" href={getBlockExplorerTxUrl(poolEvent.tx, chain)}>
              <HStack gap="0.5" justifyContent="flex-end">
                <Text>
                  {formatDistanceToNow(new Date(secondsToMilliseconds(event[0])), {
                    addSuffix: true,
                  })}
                </Text>
                <Text variant="secondary">
                  <ArrowUpRight size={12} />
                </Text>
              </HStack>
            </Link>
          </GridItem>
        </Grid>
      </Box>
    </FadeInOnView>
  )
}
