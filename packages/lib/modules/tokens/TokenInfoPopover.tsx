import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { Address } from 'viem'
import { CopyTokenAddressButton } from './CopyTokenAddressButton'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { CoingeckoIcon } from '@repo/lib/shared/components/icons/CoingeckoIcon'
import { AddTokenToWalletButton } from './AddTokenToWalletButton'
import { ExternalLink } from 'react-feather'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { useTokens } from './TokensProvider'
import {
  getBlockExplorerName,
  getBlockExplorerTokenUrl,
} from '@repo/lib/shared/utils/blockExplorer'

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
    <Popover arrowSize={12} placement="right" variant="tooltip">
      <PopoverTrigger>
        <IconButton
          _hover={{
            opacity: '1',
          }}
          aria-label="Token info"
          color="grayText"
          h="24px"
          icon={<InfoIcon />}
          isRound
          opacity="0.5"
          size="xs"
          variant="link"
        />
      </PopoverTrigger>
      <PopoverContent w="auto">
        <PopoverArrow bg="background.level2" />
        <PopoverBody>
          <HStack>
            <Text color="inherit" fontSize="sm" fontWeight="medium">
              {abbreviateAddress(tokenAddress)}
            </Text>
            <HStack spacing="xs">
              <CopyTokenAddressButton color="inherit" tokenAddress={tokenAddress} />
              <AddTokenToWalletButton chain={chain} color="inherit" tokenAddress={tokenAddress} />
              {!isBpt && coingeckoUrl && (
                <Tooltip label="View on Coingecko">
                  <IconButton
                    aria-label="View on Coingecko"
                    as="a"
                    h="6"
                    href={coingeckoUrl}
                    icon={<CoingeckoIcon height={15} width={15} />}
                    isRound
                    rel="noopener noreferrer"
                    size="xs"
                    target="_blank"
                    variant="ghost"
                    w="6"
                  />
                </Tooltip>
              )}
              <Tooltip label={`View on ${getBlockExplorerName(chain)}`}>
                <IconButton
                  aria-label="View on block explorer"
                  as="a"
                  color="grayText"
                  h="6"
                  href={getBlockExplorerTokenUrl(tokenAddress, chain)}
                  icon={<ExternalLink size={12} />}
                  isRound
                  rel="noopener noreferrer"
                  size="xs"
                  target="_blank"
                  variant="ghost"
                  w="6"
                />
              </Tooltip>
            </HStack>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
