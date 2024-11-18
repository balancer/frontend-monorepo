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
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { formatDistanceToNow, secondsToMilliseconds } from 'date-fns'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { getChainId } from '@repo/lib/config/app.config'
import { createAvatar } from '@dicebear/core'
import { identicon } from '@dicebear/collection'
import { ArrowUpRight } from 'react-feather'
import {
  getBlockExplorerAddressUrl,
  getBlockExplorerTxUrl,
} from '@repo/lib/shared/hooks/useBlockExplorer'
import { PoolActivityEl, PoolActivityTokens } from '../PoolActivity/poolActivity.types'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import React from 'react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { usePool } from '../../PoolProvider'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'

interface Props extends GridProps {
  event: PoolActivityEl
  keyValue: number
}

function EnsOrAddress({ userAddress, chain }: { userAddress: `0x${string}`; chain: GqlChain }) {
  const chainId = getChainId(getProjectConfig().ensNetwork) // perform ENS lookup through ensNetwork
  const { data: name } = useEnsName({ address: userAddress, chainId })

  const { data: ensAvatar } = useEnsAvatar({
    name: name as string,
    chainId,
  })

  const fallbackSVG = createAvatar(identicon, {
    seed: userAddress || 'unknown',
  })

  return (
    <Link href={getBlockExplorerAddressUrl(userAddress, chain)} target="_blank">
      <HStack>
        <Image
          alt={name || userAddress}
          backgroundColor="background.level4"
          borderRadius="100%"
          height="24px"
          src={ensAvatar || fallbackSVG.toDataUriSync()}
          width="24px"
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
              alignItems="center"
              bg="background.level3"
              borderRadius="full"
              display="flex"
              textTransform="none"
            >
              <HStack gap={['xs', 'sm']}>
                <TokenIcon
                  address={token.token?.address}
                  alt={token.token?.symbol || ''}
                  chain={token.token?.chain}
                  size={24}
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
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
          <GridItem>
            <EnsOrAddress chain={chain} userAddress={poolEvent.userAddress as `0x${string}`} />
          </GridItem>
          <GridItem>
            <HStack>
              <Box
                backgroundImage={
                  theme.semanticTokens.colors.chart.pool.scatter[poolEvent.action].label
                }
                borderRadius="50%"
                display="inline-block"
                height="2"
                width="2"
              />
              <Text casing="capitalize">{poolEvent.action}</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <TransactionDetails
              action={poolEvent.action}
              px="sm"
              py="2"
              tokens={poolEvent.tokens}
            />
          </GridItem>
          <GridItem textAlign="right">
            <Text>{toCurrency(poolEvent.usdValue)}</Text>
          </GridItem>
          <GridItem>
            <Link href={getBlockExplorerTxUrl(poolEvent.tx, chain)} target="_blank">
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
