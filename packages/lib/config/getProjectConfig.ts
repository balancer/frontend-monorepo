import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'
import { ProjectConfigCowAmm } from './projects/cow-amm'

export const isBalancer = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigBalancer.projectId
export const isBeets = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigBeets.projectId
export const isCowAmm = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigCowAmm.projectId

export const PROJECT_CONFIG = isBeets ? ProjectConfigBeets : ProjectConfigBalancer
