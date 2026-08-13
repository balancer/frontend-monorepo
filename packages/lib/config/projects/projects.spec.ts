import { describe, expect, it } from 'vitest'
import { ProjectConfigBalancer } from './balancer'
import { ProjectConfigBeets } from './beets'

describe('project configs', () => {
  it('are both structurally complete and distinct', () => {
    for (const projectConfig of [ProjectConfigBalancer, ProjectConfigBeets]) {
      expect(projectConfig.projectId).toBeTypeOf('string')
      expect(projectConfig.projectName).toBeTypeOf('string')
      expect(projectConfig.projectUrl).toMatch(/^https:\/\//)
      expect(projectConfig.projectLogo).toMatch(/^https:\/\//)
      expect(projectConfig.supportedNetworks.length).toBeGreaterThan(0)
      expect(projectConfig.defaultNetwork).toBeTypeOf('string')
      expect(projectConfig.ensNetwork).toBeTypeOf('string')
      expect(projectConfig.corePoolId).toMatch(/^0x/)
      expect(projectConfig.merklRewardsChains.length).toBeGreaterThan(0)
      expect(projectConfig.options).toBeDefined()
      expect(projectConfig.links).toBeDefined()
      expect(projectConfig.footer.linkSections.length).toBeGreaterThan(0)
    }
    expect(ProjectConfigBalancer.projectId).not.toBe(ProjectConfigBeets.projectId)
    expect(ProjectConfigBalancer.defaultNetwork).not.toBe(ProjectConfigBeets.defaultNetwork)
  })

  it('gate project-only features per app', () => {
    expect(ProjectConfigBeets.options.showMaBeets).toBe(true)
    expect(ProjectConfigBalancer.options.showMaBeets).toBe(false)
    expect(ProjectConfigBeets.options.allowCreateWallet).toBe(false)
    expect(ProjectConfigBalancer.options.allowCreateWallet).toBe(true)
    expect(ProjectConfigBeets.options.isOnSafeAppList).toBe(false)
    expect(ProjectConfigBalancer.options.isOnSafeAppList).toBe(true)
  })

  it('only list supported networks for their own chains', () => {
    // Beets is Sonic-only; Balancer is multi-chain and does not include Sonic
    expect(ProjectConfigBeets.supportedNetworks).toContain('SONIC')
    expect(ProjectConfigBalancer.supportedNetworks).not.toContain('SONIC')
  })
})
