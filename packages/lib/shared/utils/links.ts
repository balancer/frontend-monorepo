import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function getDiscordLink() {
  const {
    links: { socialLinks },
  } = PROJECT_CONFIG

  return socialLinks.find(link => link.iconType === 'discord')?.href
}

export function normalizeHandle(handle: string) {
  if (!handle) return ''
  if (!handle.startsWith('@')) return '@' + handle
  return handle
}
