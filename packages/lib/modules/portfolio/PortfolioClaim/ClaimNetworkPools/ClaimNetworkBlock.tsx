import { Button, Card, Flex, HStack, Heading, IconButton, Stack } from '@chakra-ui/react'
import { chainToSlugMap } from '../../../pool/pool.utils'
import { ChevronRight } from 'react-feather'
import { NetworkIcon } from '../../../../shared/components/icons/NetworkIcon'
import { useBreakpoints } from '../../../../shared/hooks/useBreakpoints'
import { useCurrency } from '../../../../shared/hooks/useCurrency'
import { GqlChain } from '../../../../shared/services/api/generated/graphql'

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
      variant="level1"
      p={['sm', 'md']}
      shadow="xl"
      flex="1"
      w="full"
      onClick={isMobile ? onClick : undefined}
    >
      <Flex justifyContent="space-between" alignItems="center">
        <HStack gap="ms">
          <NetworkIcon chain={chain} size={iconSize} />

          <Stack gap={1}>
            <Heading size="sm" textTransform={'capitalize'}>
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
              variant="ghost"
              color="font.highlight"
              icon={<ChevronRight />}
              aria-label=""
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