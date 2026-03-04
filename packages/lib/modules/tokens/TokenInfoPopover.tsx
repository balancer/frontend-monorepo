import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { HStack, IconButton, Popover, Text, Link } from '@chakra-ui/react';
import { Tooltip } from '../../shared/components/tooltips/Tooltip'
import { Address } from 'viem'
import { CopyAddressButton } from './CopyAddressButton'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { CoingeckoIcon } from '@repo/lib/shared/components/icons/CoingeckoIcon'
import { AddTokenToWalletButton } from './AddTokenToWalletButton'
import { ExternalLink } from 'react-feather'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { useTokens } from './TokensProvider'
import {
  getBlockExplorerName,
  getBlockExplorerTokenUrl } from '@repo/lib/shared/utils/blockExplorer'

type Props = {
  tokenAddress: string | Address
  chain: GqlChain
  isBpt?: boolean
}

export function TokenInfoPopover({ tokenAddress, chain, isBpt = false }: Props) {
  const { getToken } = useTokens()
  const token = getToken(tokenAddress, chain)
  const coingeckoId = token?.coingeckoId

  const coingeckoUrl = coingeckoId ? `https://www.coingecko.com/en/coins/${coingeckoId}` : undefined

  return (
    <Popover.Root
      variant="tooltip"
      positioning={{
        placement: 'right'
      }}>
      <Popover.Trigger asChild>
        <IconButton
          _hover={{
            opacity: '1' }}
          aria-label="Token info"
          color="grayText"
          h="24px"
          isRound
          opacity="0.5"
          size="xs"
          variant="link"><InfoIcon /></IconButton>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w="auto">
          <Popover.Arrow
            bg="background.level2"
            css={{
              '--arrow-size': 12
            }} />
          <Popover.Body>
            <HStack>
              <Text color="inherit" fontSize="sm" fontWeight="medium">
                {abbreviateAddress(tokenAddress)}
              </Text>
              <HStack gap="xs">
                <CopyAddressButton address={tokenAddress} color="inherit" />
                <AddTokenToWalletButton chain={chain} color="inherit" tokenAddress={tokenAddress} />
                {!isBpt && coingeckoUrl && (
                  <Tooltip content="View on Coingecko">
                    <IconButton
                      aria-label="View on Coingecko"
                      h="6"
                      isExternal
                      isRound
                      size="xs"
                      variant="ghost"
                      w="6"
                      asChild><Link href={coingeckoUrl}><CoingeckoIcon height={15} width={15} /></Link></IconButton>
                  </Tooltip>
                )}
                <Tooltip content={`View on ${getBlockExplorerName(chain)}`}>
                  <IconButton
                    aria-label="View on block explorer"
                    color="grayText"
                    h="6"
                    isExternal
                    isRound
                    size="xs"
                    variant="ghost"
                    w="6"
                    asChild><Link href={getBlockExplorerTokenUrl(tokenAddress, chain)}><ExternalLink size={12} /></Link></IconButton>
                </Tooltip>
              </HStack>
            </HStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
