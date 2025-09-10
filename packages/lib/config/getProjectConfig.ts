import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'
import { ProjectConfigCowAmm } from './projects/cow-amm'

const PROJECT_CONFIGS = {
  [ProjectConfigBalancer.projectId]: ProjectConfigBalancer,
  [ProjectConfigBeets.projectId]: ProjectConfigBeets,
  [ProjectConfigCowAmm.projectId]: ProjectConfigCowAmm,
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

export const isBalancer = projectId === ProjectConfigBalancer.projectId
export const isBeets = projectId === ProjectConfigBeets.projectId
export const isCowAmm = projectId === ProjectConfigCowAmm.projectId
export const PROJECT_CONFIG = projectId ? PROJECT_CONFIGS[projectId] : ProjectConfigBalancer
