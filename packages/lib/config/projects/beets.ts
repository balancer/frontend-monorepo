import { ProjectConfig } from '@repo/lib/config/config.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

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
}
