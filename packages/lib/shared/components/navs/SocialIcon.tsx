import { XIcon } from '../icons/social/XIcon'
import { DiscordIcon } from '../icons/social/DiscordIcon'
import { MediumIcon } from '../icons/social/MediumIcon'
import { GithubIcon } from '../icons/social/GithubIcon'
import { YoutubeIcon } from '../icons/social/YoutubeIcon'
import { TelegramIcon } from '../icons/social/TelegramIcon'

export type IconType = 'x' | 'discord' | 'medium' | 'github' | 'youtube' | 'tg'

export function SocialIcon({
  iconType,
  size = 24,
}: {
  iconType: IconType | undefined
  size?: number
}) {
  switch (iconType) {
    case 'x':
      return <XIcon size={size} />
    case 'discord':
      return <DiscordIcon size={size} />
    case 'medium':
      return <MediumIcon size={size} />
    case 'github':
      return <GithubIcon size={size} />
    case 'youtube':
      return <YoutubeIcon size={size} />
    case 'tg':
      return <TelegramIcon size={size} />
    default:
      return null
  }
}
