'use client'

import { createContext, ReactNode } from 'react'
import { useMandatoryContext } from '../shared/utils/contexts'
import { ProjectConfig } from './config.types'

type ProjectConfigProviderProps = {
  config: ProjectConfig
  children: ReactNode
}

const ProjectConfigContext = createContext<ProjectConfig | undefined>(undefined)

export function ProjectConfigProvider({ config, children }: ProjectConfigProviderProps) {
  return <ProjectConfigContext.Provider value={config}>{children}</ProjectConfigContext.Provider>
}

export const useProjectConfig = (): ProjectConfig =>
  useMandatoryContext(ProjectConfigContext, 'ProjectConfig')
