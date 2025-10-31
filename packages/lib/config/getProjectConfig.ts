import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'
import { ProjectConfig } from './config.types'

const PROJECT_CONFIGS = {
  [ProjectConfigBalancer.projectId]: ProjectConfigBalancer,
  [ProjectConfigBeets.projectId]: ProjectConfigBeets,
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as ProjectConfig['projectId']

export const isBalancer = projectId === ProjectConfigBalancer.projectId
export const isBeets = projectId === ProjectConfigBeets.projectId
export const PROJECT_CONFIG = PROJECT_CONFIGS[projectId] ?? ProjectConfigBalancer
