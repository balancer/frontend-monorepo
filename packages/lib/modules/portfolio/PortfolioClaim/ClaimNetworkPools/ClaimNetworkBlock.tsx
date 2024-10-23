import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { Button, Card, Flex, HStack, Heading, IconButton, Stack } from '@chakra-ui/react'
import { chainToSlugMap } from '../../../pool/pool.utils'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { ChevronRight } from 'react-feather'

type Props = {
  chain: GqlChain
  networkTotalClaimableFiatBalance: number
  title?: string
  onClick(): void
}

export function ClaimNetworkBlock({
  chain,
  title,
  networkTotalClaimableFiatBalance,
  onClick,
}: Props) {
  const { toCurrency } = useCurrency()
  const { isDesktop, isMobile } = useBreakpoints()

  const iconSize = isDesktop ? 12 : 8
  return (
    <Card
      flex="1"
      onClick={isMobile ? onClick : undefined}
      p={['sm', 'md']}
      shadow="xl"
      variant="level1"
      w="full"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <HStack gap="ms">
          <NetworkIcon chain={chain} size={iconSize} />

          <Stack gap={1}>
            <Heading size="sm" textTransform="capitalize">
              {title || chainToSlugMap[chain]}
            </Heading>
            {isDesktop && (
              <Heading size="md" variant="special">
                {toCurrency(networkTotalClaimableFiatBalance)}
              </Heading>
            )}
          </Stack>
        </HStack>

        {isMobile && (
          <HStack alignItems="center" gap={0} onClick={onClick}>
            <Heading size="sm" variant="sand">
              {toCurrency(networkTotalClaimableFiatBalance)}
            </Heading>
            <IconButton
              aria-label=""
              color="font.highlight"
              icon={<ChevronRight />}
              variant="ghost"
            />
          </HStack>
        )}
        {isDesktop && (
          <Button onClick={onClick} variant="secondary">
            View
          </Button>
        )}
      </Flex>
    </Card>
  )
}
