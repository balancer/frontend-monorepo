import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'
import { ProjectConfig } from './config.types'

export const allProjects: Record<string, ProjectConfig> = {
  [ProjectConfigBalancer.projectId]: ProjectConfigBalancer,
  [ProjectConfigBeets.projectId]: ProjectConfigBeets,
}

export const isBalancer = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigBalancer.projectId

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
const config = projectId ? allProjects[projectId] : ProjectConfigBalancer

if (!config) {
  throw new Error(`Invalid NEXT_PUBLIC_PROJECT_ID: "${projectId}".`)
}

export const PROJECT_CONFIG = config
