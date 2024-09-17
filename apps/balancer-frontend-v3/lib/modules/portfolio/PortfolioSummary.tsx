import { BoxProps, Card, Heading, Icon, Skeleton } from '@chakra-ui/react'
import { usePortfolio } from './PortfolioProvider'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import StarsIcon from '@/lib/shared/components/icons/StarsIcon'
import { BarChart } from 'react-feather'
import { NoisyCard } from '@/lib/shared/components/containers/NoisyCard'
import { ZenGarden } from '@/lib/shared/components/zen/ZenGarden'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

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
        variant="level2"
        width="full"
        display="flex"
        alignItems="center"
        position="relative"
        shadow="2xl"
        borderWidth={0}
        p={['md', 'md']}
        direction={['column', 'column', 'row']}
        justifyContent={['space-around']}
        gap={[3, 5]}
      >
        <NoisyCard
          cardProps={{
            ...commonNoisyCardProps.cardProps,
          }}
          contentProps={commonNoisyCardProps.contentProps}
        >
          <ZenGarden variant="diamond" sizePx="225px" />
          <Icon as={BarChart} color="font.primary" mb="sm" width="30px" height="30px" />
          <Heading size="sm" color="grayText" mb="sm">
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
          <ZenGarden variant="diamond" sizePx="225px" />
          <Icon as={StarsIcon} mb="sm" width="30px" height="30px" />
          <Heading size="sm" mb="sm" color="grayText">
            Claimable incentives
          </Heading>

          {isLoadingPortfolio || isLoadingClaimableRewards ? (
            <Skeleton height="10" w="36" />
          ) : (
            <Heading variant="special" size="lg">
              {toCurrency(totalClaimableBalance)}
            </Heading>
          )}
        </NoisyCard>
      </Card>
    </FadeInOnView>
  )
}
