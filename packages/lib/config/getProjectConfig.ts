import { ProjectConfigBeets } from './projects/beets'
import { ProjectConfigBalancer } from './projects/balancer'

export const allProjects = {
  [ProjectConfigBalancer.projectId]: { ...ProjectConfigBalancer },
  [ProjectConfigBeets.projectId]: { ...ProjectConfigBeets },
}

const PROJECT_CONFIG = process.env.NEXT_PUBLIC_PROJECT_ID
  ? allProjects[process.env.NEXT_PUBLIC_PROJECT_ID]
  : ProjectConfigBalancer

export function getProjectConfig() {
  return PROJECT_CONFIG
}