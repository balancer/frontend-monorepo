import { ProjectConfig } from '@repo/lib/config/config.types'
import { PartnerVariant, PoolListDisplayType } from '@repo/lib/modules/pool/pool.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { isProd } from '@repo/lib/config/app.config'

export const ProjectConfigBalancer: ProjectConfig = {
  projectId: 'balancer',
  projectName: 'Balancer',
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
    discordUrl: 'https://discord.balancer.fi/',
    poolComposerUrl: 'https://pool-creator.balancer.fi',
  },
  options: {
    displayType: PoolListDisplayType.TokenPills,
    hidePoolTags: [],
    hidePoolTypes: [GqlPoolType.CowAmm],
    hideProtocolVersion: ['cow'],
  },
}
