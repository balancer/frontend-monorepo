import { XIcon } from '@repo/lib/shared/components/icons/social/XIcon'
import { DiscordIcon } from '@repo/lib/shared/components/icons/social/DiscordIcon'
import { MediumIcon } from '@repo/lib/shared/components/icons/social/MediumIcon'
import { GithubIcon } from '@repo/lib/shared/components/icons/social/GithubIcon'
import { AppLink } from '@repo/lib/shared/components/navs/useNav'

export function useNavData() {
  const appLinks: AppLink[] = [
    {
      href: '/mabeets',
      label: 'maBEETS',
    },
    {
      href: '/sftmx',
      label: 'sFTMX',
    },
  ]

  const ecosystemLinks = [
    { label: 'Docs', href: 'https://docs.beets.fi/' },
    { label: 'Governance', href: 'https://snapshot.org/#/beets.eth' },
    { label: 'Analytics', href: 'https://beets.defilytica.com/' },
  ]

  const getSocialLinks = (size = 24) => [
    {
      icon: <XIcon size={size} />,
      href: 'https://x.com/beethoven_x',
    },
    {
      icon: <DiscordIcon size={size} />,
      href: 'https://beets.fi/discord',
    },
    {
      icon: <MediumIcon size={size} />,
      href: 'https://beethovenxio.medium.com/',
    },
    {
      icon: <GithubIcon size={size} />,
      href: 'https://github.com/beethovenxfi/',
    },
  ]

  return { appLinks, ecosystemLinks, getSocialLinks }
}
