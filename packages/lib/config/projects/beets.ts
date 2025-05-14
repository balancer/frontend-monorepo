import { ProjectConfig } from '@repo/lib/config/config.types'
import { PoolDisplayType } from '@repo/lib/modules/pool/pool.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

export const beetsSupportedNetworks = [GqlChain.Optimism, GqlChain.Sonic]
//  as const satisifies GqlChain[]

export const ProjectConfigBeets: ProjectConfig = {
  projectId: 'beets',
  projectName: 'Beets',
  projectUrl: 'https://beets.fi',
  projectLogo: 'https://beets.fi/images/icons/beets.svg',
  supportedNetworks: beetsSupportedNetworks,
  networksForProtocolStats: [...beetsSupportedNetworks, GqlChain.Fantom],
  corePoolId: '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005', // maBEETS BEETS8020 (Fresh BEETS) pool on Sonic
  defaultNetwork: GqlChain.Sonic,
  ensNetwork: GqlChain.Sonic,
  delegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b', // TODO update this for sonic & optimism,
  externalLinks: {
    poolComposerUrl: 'https://pool-creator.balancer.fi/beets',
  },
  merklRewardsChains: [GqlChain.Sonic],
  options: {
    poolDisplayType: PoolDisplayType.Name,
    hidePoolTags: ['RWA', 'VE8020'],
    hidePoolTypes: [
      GqlPoolType.LiquidityBootstrapping,
      GqlPoolType.CowAmm,
      GqlPoolType.Fx,
      GqlPoolType.QuantAmmWeighted,
      GqlPoolType.Reclamm,
    ],
    hideProtocolVersion: ['cow'],
    showPoolName: true,
    showVeBal: false,
    showMaBeets: true,
    allowCreateWallet: false,
    showPoolHooksFilter: false,
    isOnSafeAppList: false,
  },
  links: {
    appLinks: [
      {
        href: '/stake',
        label: 'Stake $S',
      },
      {
        href: 'https://ma.beets.fi',
        label: 'maBEETS',
        isExternal: true,
      },
      {
        href: 'https://www.spoints.fyi/gems',
        label: 'Sonic Gems',
        isExternal: true,
      },
    ],
    ecosystemLinks: [
      { label: 'Docs', href: 'https://docs.beets.fi/' },
      { label: 'Governance', href: 'https://snapshot.org/#/beets.eth' },
    ],
    socialLinks: [
      {
        iconType: 'x',
        href: 'https://x.com/beets_fi',
      },
      {
        iconType: 'discord',
        href: 'https://beets.fi/discord',
      },
      {
        iconType: 'medium',
        href: 'https://beetsfi.medium.com/',
      },
      {
        iconType: 'github',
        href: 'https://github.com/beethovenxfi/',
      },
    ],
    legalLinks: [{ label: 'Terms of service', href: '/terms-of-service' }],
  },
  footer: {
    linkSections: [
      {
        title: 'Build on Beets',
        links: [
          { label: 'Home', href: '/' },

          { label: 'Docs', href: 'https://docs.beets.fi', isExternal: true },
          {
            label: 'Prototype on v3',
            href: 'https://github.com/balancer/scaffold-balancer-v3',
            isExternal: true,
          },
        ],
      },
      {
        title: 'Use Beets protocol',
        links: [
          { label: 'Explore pools', href: '/pools' },
          { label: 'Swap tokens', href: '/swap' },
          { label: 'View portfolio', href: '/portfolio' },
          { label: 'Get maBEETS', href: 'https://ma.beets.fi', isExternal: true },
        ],
      },
      {
        title: 'Ecosystem',
        links: [
          { label: 'Governance', href: 'https://snapshot.box/#/s:beets.eth', isExternal: true },
          {
            label: 'Bug bounties',
            href: 'https://immunefi.com/bug-bounty/balancer',
            isExternal: true,
          },
        ],
      },
    ],
  },
  cowSupportedNetworks: [],
  promoItems: [
    {
      id: 0,
      icon: 'boosted',
      title: '100% Boosted Pools on Balancer v3',
      description:
        'A simple, capital efficient strategy for LPs to get boosted yield. Partnering with leading lending protocols like Aave and Morpho.',
      buttonText: 'View pools',
      buttonLink: '/pools?poolTags=BOOSTED',
      linkText: 'Learn more',
      linkURL:
        'https://docs.balancer.fi/concepts/explore-available-balancer-pools/boosted-pool.html',
      linkExternal: true,
      bgImageActive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-active',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive',
      },
    },
    {
      id: 1,
      icon: 'v3',
      title: 'Balancer v3 is live and thriving!',
      description:
        'A simple, flexible, powerful platform to innovate upon and build the future of AMMs. Battle-tested on-chain since November.',
      buttonText: 'View pools',
      buttonLink: 'pools?protocolVersion=3',
      linkText: 'Learn more',
      linkURL: 'https://docs.balancer.fi/partner-onboarding/balancer-v3/v3-overview.html',
      linkExternal: true,
      bgImageActive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-active',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive',
      },
    },
    {
      id: 2,
      icon: 'gyro',
      title: 'Superliquidity, made simple',
      description:
        'Next generation Gyroscope pools are now live on Balancer v3. Manage liquidity directly within the Balancer UI.',
      buttonText: 'View pools',
      buttonLink: '/pools?protocolVersion=3&poolTypes=GYRO',
      linkText: 'Learn more',
      linkURL: 'https://www.gyro.finance/',
      linkExternal: true,
      bgImageActive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-active',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive',
      },
    },
    {
      id: 3,
      icon: 'hook',
      title: 'StableSurge Hook',
      description:
        'A dynamic directional surge swap fee in times of volatility to help defend the peg. LPs get MEV protection and increased fees.',
      buttonText: 'View pools',
      buttonLink: '/pools?poolHookTags=HOOKS_STABLESURGE',
      linkText: 'Learn more',
      linkURL: 'https://medium.com/balancer-protocol/balancers-stablesurge-hook-09d2eb20f219',
      linkExternal: true,
      bgImageActive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-active',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive',
      },
    },
  ],
}
