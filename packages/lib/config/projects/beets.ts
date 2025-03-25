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
  corePoolId: '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005', // maBEETS BEETS8020 (Fresh BEETS) pool on Sonic
  defaultNetwork: GqlChain.Sonic,
  ensNetwork: GqlChain.Sonic,
  delegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b', // TODO update this for sonic & optimism,
  externalLinks: {
    poolComposerUrl: 'https://ma.beets.fi/compose',
  },
  options: {
    poolDisplayType: PoolDisplayType.Name,
    hidePoolTags: ['RWA', 'VE8020'],
    hidePoolTypes: [GqlPoolType.LiquidityBootstrapping, GqlPoolType.CowAmm, GqlPoolType.Fx],
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
    ],
    ecosystemLinks: [
      { label: 'Docs', href: 'https://docs.beets.fi/' },
      { label: 'Governance', href: 'https://snapshot.org/#/beets.eth' },
      { label: 'Analytics', href: 'https://beets.defilytica.com/' },
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
          { label: 'Analytics', href: 'https://beets.defilytica.com', isExternal: true },
        ],
      },
    ],
  },
  cowSupportedNetworks: [],
}
