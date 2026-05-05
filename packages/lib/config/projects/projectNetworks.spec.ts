import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ProjectConfigBalancer } from './balancer'
import { ProjectConfigBeets } from './beets'

describe('project supported networks', () => {
  it('keeps Optimism available in the Balancer app', () => {
    expect(ProjectConfigBalancer.supportedNetworks).toContain(GqlChain.Optimism)
  })

  it('removes Optimism from the Beets app', () => {
    expect(ProjectConfigBeets.supportedNetworks).toEqual([GqlChain.Sonic])
    expect(ProjectConfigBeets.supportedNetworks).not.toContain(GqlChain.Optimism)
  })
})
