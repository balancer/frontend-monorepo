import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'
import { ProjectConfig } from './config.types'

export const allProjects: Record<string, ProjectConfig> = {
  [ProjectConfigBalancer.projectId]: ProjectConfigBalancer,
  [ProjectConfigBeets.projectId]: ProjectConfigBeets,
}

export const PROJECT_CONFIG = process.env.NEXT_PUBLIC_PROJECT_ID
  ? allProjects[process.env.NEXT_PUBLIC_PROJECT_ID]
  : ProjectConfigBalancer

export const isBeetsProject = PROJECT_CONFIG.projectId === 'beets'
export const isBalancerProject = PROJECT_CONFIG.projectId === 'balancer'

// TODO replace with just PROJECT_CONFIG everywhere
export function getProjectConfig() {
  return PROJECT_CONFIG
}
