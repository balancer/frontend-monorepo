import { ProjectConfig } from '@repo/lib/config/config.types'
import { PartnerVariant, PoolDisplayType } from '@repo/lib/modules/pool/pool.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { isProd } from '@repo/lib/config/app.config'

export const ProjectConfigBalancer: ProjectConfig = {
  projectId: 'balancer',
  projectName: 'Balancer',
  projectUrl: 'https://balancer.fi',
  projectLogo: 'https://balancer.fi/images/icons/balancer.svg',
  supportedNetworks: [
    GqlChain.Mainnet,
    GqlChain.Arbitrum,
    GqlChain.Avalanche,
    GqlChain.Base,
    GqlChain.Gnosis,
    GqlChain.Polygon,
    GqlChain.Zkevm,
    GqlChain.Optimism,
    GqlChain.Mode,
    GqlChain.Fraxtal,

    // testnets only in dev mode
    ...(isProd ? [] : [GqlChain.Sepolia]),
  ],
  variantConfig: {
    [PartnerVariant.cow]: {
      banners: {
        headerSrc: '/images/partners/cow-header.svg',
        footerSrc: '/images/partners/cow-footer.svg',
      },
    },
  },
  corePoolId: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014', // veBAL BAL8020 (Balancer 80 BAL 20 WETH) pool on Ethereum
  defaultNetwork: GqlChain.Mainnet,
  ensNetwork: GqlChain.Mainnet,
  delegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  externalLinks: {
    poolComposerUrl: 'https://pool-creator.balancer.fi',
  },
  merklRewardsChains: [GqlChain.Mainnet, GqlChain.Arbitrum, GqlChain.Base, GqlChain.Mode],
  options: {
    poolDisplayType: PoolDisplayType.TokenPills,
    hidePoolTags: [],
    hidePoolTypes: [GqlPoolType.LiquidityBootstrapping, GqlPoolType.Fx],
    hideProtocolVersion: [],
    showPoolName: false,
    showVeBal: true,
    showMaBeets: false,
    allowCreateWallet: true,
    showPoolHooksFilter: true,
    isOnSafeAppList: true,
  },
  links: {
    appLinks: [],
    ecosystemLinks: [
      { label: 'Build', href: 'https://balancer.fi/build' },
      { label: 'Blog', href: 'https://medium.com/balancer-protocol' },
      { label: 'Docs', href: 'https://docs.balancer.fi/' },
      { label: 'Governance', href: 'https://vote.balancer.fi/#/' },
      { label: 'Analytics', href: 'https://dune.com/balancer' },
      { label: 'Forum', href: 'https://forum.balancer.fi/' },
      {
        label: 'Grants',
        href: 'https://grants.balancer.community',
      },
    ],
    socialLinks: [
      {
        iconType: 'x',
        href: 'https://x.com/Balancer',
      },
      {
        iconType: 'discord',
        href: 'https://discord.balancer.fi/',
      },
      {
        iconType: 'medium',
        href: 'https://medium.com/balancer-protocol',
      },
      {
        iconType: 'youtube',
        href: 'https://www.youtube.com/channel/UCBRHug6Hu3nmbxwVMt8x_Ow',
      },
      {
        iconType: 'github',
        href: 'https://github.com/balancer/',
      },
    ],
    legalLinks: [
      { label: 'Terms of use', href: '/terms-of-use' },
      { label: 'Privacy policy', href: '/privacy-policy' },
      { label: 'Cookies policy', href: '/cookies-policy' },
      { label: '3rd party services', href: '/3rd-party-services' },
      { label: 'Risks', href: '/risks' },
    ],
  },
  footer: {
    linkSections: [
      {
        title: 'Build on Balancer',
        links: [
          { label: 'Home', href: '/' },
          { label: 'v3 Docs', href: 'https://docs.balancer.fi', isExternal: true },
          {
            label: 'Prototype on v3',
            href: 'https://github.com/balancer/scaffold-balancer-v3',
            isExternal: true,
          },
          { label: 'Grants', href: 'https://grants.balancer.community', isExternal: true },
          { label: 'v2 Docs', href: 'https://docs-v2.balancer.fi', isExternal: true },
        ],
      },
      {
        title: 'Use Balancer protocol',
        links: [
          { label: 'Explore pools', href: '/pools' },
          { label: 'Swap tokens', href: '/swap' },
          { label: 'View portfolio', href: '/portfolio' },
          {
            label: 'Get veBAL',
            href: 'https://app.balancer.fi/#/ethereum/vebal',
            isExternal: true,
          },
          {
            label: 'Create an LBP',
            href: 'https://www.fjordfoundry.com/?utm_source=balancer&utm_medium=website',
            isExternal: true,
          },
        ],
      },
      {
        title: 'Ecosystem',
        links: [
          { label: 'Forum', href: 'https://forum.balancer.fi', isExternal: true },
          { label: 'Governance', href: 'https://vote.balancer.fi', isExternal: true },
          {
            label: 'Bug bounties',
            href: 'https://immunefi.com/bug-bounty/balancer',
            isExternal: true,
          },
          { label: 'Dune Analytics', href: 'https://dune.com/balancer', isExternal: true },
          { label: 'Defilytica', href: 'https://balancer.defilytica.com', isExternal: true },
          {
            label: 'Brand assets',
            href: 'https://github.com/balancer/brand-assets',
            isExternal: true,
          },
        ],
      },
    ],
  },
  cowSupportedNetworks: [GqlChain.Mainnet, GqlChain.Arbitrum, GqlChain.Base, GqlChain.Gnosis],
  partnerCards: [
    {
      backgroundImage: 'images/partners/cards/partner-xave-bg.png',
      bgColor: 'blue.400',
      ctaText: 'View pools',
      ctaUrl: 'pools?poolTypes=QUANT_AMM_WEIGHTED',
      description:
        'Auto-rebalancing pools designed to capture additional yield from price volatility.',
      externalLink: false,
      iconName: 'quantamm',
      title: 'QuantAMM',
    },
    {
      backgroundImage: 'images/partners/cards/partner-cow-bg.png',
      bgColor: 'green.900',
      ctaText: 'View pools',
      ctaUrl: '/pools/cow',
      description: 'The first MEV-capturing AMM. More returns, less risk with LVR protection.',
      iconName: 'cow',
      title: 'CoW AMM',
    },
    {
      backgroundImage: 'images/partners/cards/partner-gyro-bg.png',
      bgColor: 'pink.600',
      ctaText: 'View pools',
      ctaUrl: 'pools?poolTypes=GYRO',
      description: 'Concentrated Liquidity Pools on Balancer. Improves capital efficiency for LPs.',
      externalLink: false,
      iconName: 'gyro',
      title: 'Gyroscope',
    },
  ],
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
        imgName: 'bg-active0',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive0',
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
        imgName: 'bg-active1',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive1',
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
        imgName: 'bg-active2',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive2',
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
        imgName: 'bg-active3',
      },
      bgImageInactive: {
        directory: '/images/promos/promo-banner/',
        imgName: 'bg-inactive3',
      },
    },
  ],
}
