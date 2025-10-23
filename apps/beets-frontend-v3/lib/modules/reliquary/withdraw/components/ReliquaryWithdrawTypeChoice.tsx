import { Box, Button, Flex, Grid, GridItem, Skeleton, Text } from '@chakra-ui/react'
import { BeetsBox } from '~/components/box/BeetsBox'
import { numberFormatUSDValue } from '~/lib/util/number-formats'
import { useRelicDepositBalance } from '~/modules/reliquary/lib/useRelicDepositBalance'
import ReliquaryTokenBreakdown from '~/modules/reliquary/components/ReliquaryTokensBreakdown'
import useReliquary from '~/modules/reliquary/lib/useReliquary'
import { ReliquaryWithdrawDescription } from '~/modules/reliquary/withdraw/components/ReliquaryWithdrawDescription'

interface Props {
  onShowProportional(): void
  onShowSingleAsset(): void
}

export function ReliquaryWithdrawTypeChoice({ onShowProportional, onShowSingleAsset }: Props) {
  const { relicBalanceUSD, isLoading: isRelicDepositBalanceLoading } = useRelicDepositBalance()
  const { selectedRelicId } = useReliquary()

  return (
    <Box p="4">
      <Grid mt="4" mb="6" gap="8" templateColumns={{ base: '1fr', md: '1fr', lg: '1fr 1fr' }}>
        <GridItem>
          <BeetsBox p="2" mb="6">
            <Flex>
              <Text fontSize="lg" fontWeight="semibold" flex="1">
                Relic #{selectedRelicId} balance
              </Text>
              <Skeleton isLoaded={!isRelicDepositBalanceLoading}>
                <Text fontSize="lg" fontWeight="semibold">
                  {numberFormatUSDValue(relicBalanceUSD)}
                </Text>
              </Skeleton>
            </Flex>
          </BeetsBox>
          <BeetsBox p="2">
            <Text fontSize="lg" fontWeight="semibold" mb="4">
              Tokens breakdown
            </Text>
            <ReliquaryTokenBreakdown showTotal />
          </BeetsBox>
        </GridItem>
        <GridItem>
          <BeetsBox p="4">
            <ReliquaryWithdrawDescription />
          </BeetsBox>
        </GridItem>
      </Grid>
      <Button variant="primary" width="full" onClick={onShowProportional}>
        Withdraw proportionally
      </Button>
      {/* <Button
                variant="secondary"
                width="full"
                mt="2"
                isDisabled={relicBalanceUSD <= 0}
                onClick={onShowSingleAsset}
            >
                Single asset withdraw
            </Button> */}
    </Box>
  )
}
