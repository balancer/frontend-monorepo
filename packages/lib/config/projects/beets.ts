import { ProjectConfig } from '@repo/lib/config/config.types'
import { PoolListDisplayType } from '@repo/lib/modules/pool/pool.types'
import { GqlChain, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

export const beetsSupportedNetworks = [GqlChain.Optimism, GqlChain.Sonic]
//  as const satisifies GqlChain[]

export const ProjectConfigBeets: ProjectConfig = {
  projectId: 'beets',
  projectName: 'Beets',
  supportedNetworks: beetsSupportedNetworks,
  corePoolId: '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005', // maBEETS BEETS8020 (Fresh BEETS) pool on Sonic
  defaultNetwork: GqlChain.Sonic,
  ensNetwork: GqlChain.Sonic,
  delegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b', // TODO update this for sonic & optimism,
  externalLinks: {
    discordUrl: 'https://beets.fi/discord',
    poolComposerUrl: 'https://ma.beets.fi/compose',
  },
  // TODO: Remove this once config is moved to app folder
  options: {
    displayType: PoolListDisplayType.Name,
    hidePoolTags: ['VE8020', 'BOOSTED'],
    hidePoolTypes: [GqlPoolType.LiquidityBootstrapping, GqlPoolType.CowAmm, GqlPoolType.Fx],
    hideProtocolVersion: ['cow', 'v3'],
    showPoolName: true,
  },
}
