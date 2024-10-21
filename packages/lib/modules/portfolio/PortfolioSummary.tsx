import { BoxProps, Card, Heading, Icon, Skeleton } from '@chakra-ui/react'
import { usePortfolio } from './PortfolioProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { BarChart } from 'react-feather'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@repo/lib/shared/components/zen/ZenGarden'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

const commonNoisyCardProps: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 'none',
    borderBottomRightRadius: 'none',
    py: [8],
  },
  cardProps: {
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
  },
}
export function PortfolioSummary() {
  const {
    portfolioData,
    totalFiatClaimableBalance,
    protocolRewardsBalance,
    isLoadingPortfolio,
    isLoadingClaimableRewards,
  } = usePortfolio()
  const { toCurrency } = useCurrency()
  const totalBalance = portfolioData?.userTotalBalance?.toNumber()
  const totalClaimableBalance = totalFiatClaimableBalance.plus(protocolRewardsBalance)

  return (
    <FadeInOnView>
      <Card
        alignItems="center"
        borderWidth={0}
        direction={['column', 'column', 'row']}
        display="flex"
        gap={[3, 5]}
        justifyContent={['space-around']}
        p={['md', 'md']}
        position="relative"
        shadow="2xl"
        variant="level2"
        width="full"
      >
        <NoisyCard
          cardProps={{
            ...commonNoisyCardProps.cardProps,
          }}
          contentProps={commonNoisyCardProps.contentProps}
        >
          <ZenGarden sizePx="225px" variant="diamond" />
          <Icon as={BarChart} color="font.primary" height="30px" mb="sm" width="30px" />
          <Heading color="grayText" mb="sm" size="sm">
            My Balancer liquidity
          </Heading>
          {isLoadingPortfolio ? (
            <Skeleton height="10" w="36" />
          ) : (
            <Heading size="lg">{toCurrency(totalBalance)}</Heading>
          )}
        </NoisyCard>

        <NoisyCard
          cardProps={{
            ...commonNoisyCardProps.cardProps,
          }}
          contentProps={commonNoisyCardProps.contentProps}
        >
          <ZenGarden sizePx="225px" variant="diamond" />
          <Icon as={StarsIcon} height="30px" mb="sm" width="30px" />
          <Heading color="grayText" mb="sm" size="sm">
            Claimable incentives
          </Heading>

          {isLoadingPortfolio || isLoadingClaimableRewards ? (
            <Skeleton height="10" w="36" />
          ) : (
            <Heading size="lg" variant="special">
              {toCurrency(totalClaimableBalance)}
            </Heading>
          )}
        </NoisyCard>
      </Card>
    </FadeInOnView>
  )
}
