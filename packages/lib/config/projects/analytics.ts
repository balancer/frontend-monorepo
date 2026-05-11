import { ProjectConfig } from '@repo/lib/config/config.types'
import { ProjectConfigBalancer } from './balancer'

// Analytics is a Balancer surface — it inherits the Balancer chain set,
// pool gating, and supporting metadata. Identity-only fields are overridden
// so the app advertises itself correctly. Feature divergence should be
// expressed via per-app env vars rather than forking this config wholesale.
export const ProjectConfigAnalytics: ProjectConfig = {
  ...ProjectConfigBalancer,
  projectId: 'analytics',
  projectName: 'Balancer Analytics',
  projectUrl: 'https://analytics.balancer.fi',
}
