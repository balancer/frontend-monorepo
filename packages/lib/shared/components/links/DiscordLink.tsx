import { BalAlertLink } from '@repo/lib/shared/components/alerts/BalAlertLink'
import { getDiscordLink } from '@repo/lib/shared/utils/links'

export function DiscordLink() {
  const discordUrl = getDiscordLink()
  return (
    <BalAlertLink href={discordUrl} isExternal>
      our discord
    </BalAlertLink>
  )
}
