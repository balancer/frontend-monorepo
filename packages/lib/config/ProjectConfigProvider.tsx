'use client'

import { createContext, ReactNode } from 'react'
import { useMandatoryContext } from '../shared/utils/contexts'
import { ProjectConfig } from './config.types'
import { GqlChain } from '../shared/services/api/generated/graphql'

type ProjectConfigProviderProps = {
  config: ProjectConfig
  children: ReactNode
}

type ProjectFlags = {
  isMaBeets: boolean
  isVeBal: boolean
}

// Global project constants that can be imported
export let projectName: string
export let projectId: 'beets' | 'balancer'
export let discordUrl: string
export let supportedNetworks: GqlChain[]
export let defaultNetwork: GqlChain

const ProjectConfigContext = createContext<ProjectConfig | undefined>(undefined)
const ProjectFlagsContext = createContext<ProjectFlags | undefined>(undefined)

export function ProjectConfigProvider({ config, children }: ProjectConfigProviderProps) {
  projectName = config.projectName
  projectId = config.projectId
  discordUrl = config.externalLinks.discordUrl
  supportedNetworks = config.supportedNetworks
  defaultNetwork = config.defaultNetwork

  // TODO: set this dynamically like below or statically like 'isBeetsProject' & 'isBalancerProject'?
  const flags: ProjectFlags = {
    isMaBeets:
      config.corePoolId === '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005',
    isVeBal:
      config.corePoolId === '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
  }

  return (
    <ProjectConfigContext.Provider value={config}>
      <ProjectFlagsContext.Provider value={flags}>{children}</ProjectFlagsContext.Provider>
    </ProjectConfigContext.Provider>
  )
}

export const useProjectConfig = (): ProjectConfig =>
  useMandatoryContext(ProjectConfigContext, 'ProjectConfig')

export const useProjectFlags = (): ProjectFlags =>
  useMandatoryContext(ProjectFlagsContext, 'ProjectFlags')
