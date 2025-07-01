import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'

export const isBalancer = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigBalancer.projectId
export const isBeets = process.env.NEXT_PUBLIC_PROJECT_ID === ProjectConfigBeets.projectId

export const PROJECT_CONFIG = isBeets ? ProjectConfigBeets : ProjectConfigBalancer
