import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'
import { ProjectConfig } from './config.types'

export const allProjects: Record<string, ProjectConfig> = {
  [ProjectConfigBalancer.projectId]: ProjectConfigBalancer,
  [ProjectConfigBeets.projectId]: ProjectConfigBeets,
}

export const isBalancer = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigBalancer.projectId

export const PROJECT_CONFIG = process.env.NEXT_PUBLIC_PROJECT_ID
  ? allProjects[process.env.NEXT_PUBLIC_PROJECT_ID]
  : ProjectConfigBalancer
