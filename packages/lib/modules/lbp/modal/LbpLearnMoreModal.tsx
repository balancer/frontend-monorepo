import { LearnMoreModal } from '../../../shared/components/modals/LearnMoreModal'

export function LbpLearnMoreModal({ buttonLabel }: { buttonLabel: string }) {
  return (
    <LearnMoreModal
      buttonLabel={buttonLabel}
      docsUrl="https://docs.balancer.fi/concepts/explore-available-balancer-pools/liquidity-bootstrapping-pool.html"
      headerText="Learn more about LBPs"
      listItems={[
        'LBPs typically start with an uneven ratio (like 90:10) heavily weighted toward the project token, with a high initial price, and gradually shift over a predetermined time period.',
        'The pool automatically adjusts token weights over time, causing the price to decrease until there is sufficient buying pressure, which helps establish natural price discovery.',
        'Projects only need to provide their token and a small portion (typically 10-20%) of a collateral asset (like ETH or USDC) to start the pool, making it capital efficient.',
        'The dynamic weight mechanism forces large buyers to split their trades into smaller amounts over time, preventing price manipulation and enabling fairer distribution.',
      ]}
    />
  )
}
