import { getBlockExplorerName, useBlockExplorer } from '@/lib/shared/hooks/useBlockExplorer'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
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
import { abbreviateAddress } from '@/lib/shared/utils/addresses'
import { CoingeckoIcon } from '@/lib/shared/components/icons/CoingeckoIcon'
import { AddTokenToWalletButton } from './AddTokenToWalletButton'
import { ExternalLink } from 'react-feather'
import { InfoIcon } from '@/lib/shared/components/icons/InfoIcon'
import { useTokens } from './TokensProvider'

type Props = {
  tokenAddress: string | Address
  chain: GqlChain
  isBpt?: boolean
}

export function TokenInfoPopover({ tokenAddress, chain, isBpt = false }: Props) {
  const { getBlockExplorerTokenUrl } = useBlockExplorer(chain)
  const { getToken } = useTokens()
  const token = getToken(tokenAddress, chain)
  const coingeckoId = token?.coingeckoId

  const coingeckoUrl = coingeckoId ? `https://www.coingecko.com/en/coins/${coingeckoId}` : undefined

  return (
    <Popover placement="right" variant="tooltip" arrowSize={12}>
      <PopoverTrigger>
        <IconButton
          h="24px"
          size="xs"
          isRound
          variant="link"
          aria-label="Token info"
          color="grayText"
          icon={<InfoIcon />}
          opacity="0.5"
          _hover={{
            opacity: '1',
          }}
        />
      </PopoverTrigger>
      <PopoverContent w="auto">
        <PopoverArrow bg="background.level2" />
        <PopoverBody>
          <HStack>
            <Text color="inherit" fontWeight="medium" fontSize="sm">
              {abbreviateAddress(tokenAddress)}
            </Text>
            <HStack spacing="xs">
              <CopyTokenAddressButton tokenAddress={tokenAddress} color="inherit" />
              <AddTokenToWalletButton tokenAddress={tokenAddress} chain={chain} color="inherit" />
              {!isBpt && coingeckoUrl && (
                <Tooltip label="View on Coingecko">
                  <IconButton
                    size="xs"
                    isRound
                    variant="ghost"
                    aria-label="View on Coingecko"
                    w="6"
                    h="6"
                    icon={<CoingeckoIcon width={15} height={15} />}
                    as="a"
                    href={coingeckoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                </Tooltip>
              )}
              <Tooltip label={`View on ${getBlockExplorerName(chain)}`}>
                <IconButton
                  size="xs"
                  isRound
                  variant="ghost"
                  w="6"
                  h="6"
                  aria-label="View on block explorer"
                  color="grayText"
                  icon={<ExternalLink size={12} />}
                  as="a"
                  href={getBlockExplorerTokenUrl(tokenAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </Tooltip>
            </HStack>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
