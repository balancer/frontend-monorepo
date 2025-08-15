import { PoolType } from '@balancer/sdk'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'

export const POOL_TYPES = [
  { label: 'Weighted', value: PoolType.Weighted, maxTokens: 8 },
  { label: 'Stable', value: PoolType.Stable, maxTokens: 5 },
  { label: 'Stable Surge', value: PoolType.StableSurge, maxTokens: 5 },
  { label: 'Gyro Elliptic CLP', value: PoolType.GyroE, maxTokens: 2 },
  { label: 'reClamm', value: PoolType.ReClamm, maxTokens: 2 },
]

export const PROTOCOLS = [
  {
    id: ProjectConfigBalancer.projectId,
    name: ProjectConfigBalancer.projectName,
    imageSrc: ProjectConfigBalancer.projectLogo,
  },
  {
    id: ProjectConfigBeets.projectId,
    name: ProjectConfigBeets.projectName,
    imageSrc: ProjectConfigBeets.projectLogo,
  },
]

export const WEIGHTED_POOL_STRUCTURES = ['2-token: 50/50', '2-token: 80/20', 'custom']
