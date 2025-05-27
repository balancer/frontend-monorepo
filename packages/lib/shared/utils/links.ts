import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function getDiscordLink() {
  const {
    links: { socialLinks },
  } = PROJECT_CONFIG

  return socialLinks.find(link => link.iconType === 'discord')?.href
}
