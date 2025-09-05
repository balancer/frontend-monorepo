import { ProjectConfig } from '@repo/lib/config/config.types'
import { PartnerVariant, PoolDisplayType } from '@repo/lib/modules/pool/pool.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { isProd } from '@repo/lib/config/app.config'

export const ProjectConfigCowAmm: ProjectConfig = {
  projectId: 'cow-amm',
  projectName: 'CoW AMM',
  projectUrl: 'https://cow-amm.balancer.fi',
  projectLogo: 'https://cow-amm.balancer.fi/images/icons/cow-amm.svg',
  supportedNetworks: [
    GqlChain.Mainnet,
    GqlChain.Arbitrum,
    GqlChain.Avalanche,
    GqlChain.Base,
    GqlChain.Gnosis,
    GqlChain.Polygon,
  ],
  variantConfig: {
    [PartnerVariant.cow]: {
      banners: {
        headerSrc: '/images/partners/cow-header.svg',
        footerSrc: '/images/partners/cow-footer.svg',
      },
    },
  },
  corePoolId: '',
  defaultNetwork: GqlChain.Gnosis,
  ensNetwork: GqlChain.Mainnet,
  delegateOwner: '0x',
  externalLinks: {
    poolComposerUrl: 'https://pool-creator.balancer.fi/cow',
  },
  merklRewardsChains: [GqlChain.Mainnet, GqlChain.Arbitrum, GqlChain.Base, GqlChain.Mode],
  options: {
    poolDisplayType: PoolDisplayType.TokenPills,
    hidePoolTags: ['DYNAMIC_ECLP'],
    hidePoolTypes: [GqlPoolType.Fx, ...(isProd ? [GqlPoolType.LiquidityBootstrapping] : [])],
    hideProtocolVersion: ['v2', 'v3'],
    showPoolName: false,
    showVeBal: false,
    showMaBeets: false,
    allowCreateWallet: true,
    isOnSafeAppList: true,
  },
  links: {
    appLinks: [{ href: '/vebal', label: 'veBAL', isExternal: true }],
    ecosystemLinks: [
      { label: 'Pool creator', href: 'https://pool-creator.balancer.fi/cow' },
      { label: 'Blog', href: 'https://medium.com/balancer-protocol' },
      { label: 'Docs', href: 'https://docs.balancer.fi/' },
      { label: 'Governance', href: 'https://vote.balancer.fi/#/' },
      { label: 'Analytics', href: 'https://dune.com/balancer' },
      { label: 'Forum', href: 'https://forum.balancer.fi/' },
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
          { label: 'Balancer Home', href: 'https://balancer.fi', isExternal: true },
          { label: 'v3 Docs', href: 'https://docs.balancer.fi', isExternal: true },
          {
            label: 'Prototype on v3',
            href: 'https://github.com/balancer/scaffold-balancer-v3',
            isExternal: true,
          },
          { label: 'Code & Contracts', href: 'https://github.com/balancer/', isExternal: true },
          { label: 'v2 Docs', href: 'https://docs-v2.balancer.fi', isExternal: true },
        ],
      },
      {
        title: 'Use Balancer protocol',
        links: [
          { label: 'Explore pools', href: '/pools' },
          { label: 'Swap tokens', href: '/swap', isExternal: true },
          { label: 'View portfolio', href: '/portfolio', isExternal: true },
          { label: 'Get veBAL', href: '/vebal', isExternal: true },
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
      icon: 'reclamm',
      label: 'reCLAMM pools',
      title: 'New readjusting Concentrated Liquidity Pools',
      description:
        'Maximize capital efficiency with reCLAMMs: Auto-readjusting concentrated liquidity—no micro-management of positions needed.',
      buttonText: 'View pools',
      buttonLink: '/pools?poolTypes=RECLAMM',
      linkText: 'Learn more',
      linkURL:
        'https://medium.com/balancer-protocol/introducing-reclamms-self-readjusting-trustless-passive-lping-for-clamms-b5528429588e',
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
      icon: 'boosted',
      label: 'Boosted Pools',
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
      label: 'Gyroscope',
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
      label: 'StableSurge Hook',
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
