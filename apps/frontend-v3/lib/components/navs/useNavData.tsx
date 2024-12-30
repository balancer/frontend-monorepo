import { XIcon } from '@repo/lib/shared/components/icons/social/XIcon'
import { DiscordIcon } from '@repo/lib/shared/components/icons/social/DiscordIcon'
import { MediumIcon } from '@repo/lib/shared/components/icons/social/MediumIcon'
import { YoutubeIcon } from '@repo/lib/shared/components/icons/social/YoutubeIcon'
import { GithubIcon } from '@repo/lib/shared/components/icons/social/GithubIcon'
import { isDev, isStaging } from '@repo/lib/config/app.config'
import { ProjectConfigBalancer } from '@/lib/config/projectConfig'

export function useNavData() {
  const appLinks = []

  // To-do: Remove this when veBAL is live
  if (isDev || isStaging) {
    appLinks.push({
      label: 'veBAL (wip)',
      href: '/vebal',
    })
  }

  const ecosystemLinks = [
    { label: 'Build', href: 'https://balancer.fi/build' },
    { label: 'Blog', href: 'https://medium.com/balancer-protocol' },
    { label: 'Docs', href: 'https://docs.balancer.fi/' },
    { label: 'Governance', href: 'https://vote.balancer.fi/#/' },
    { label: 'Analytics', href: 'https://dune.com/balancer' },
    { label: 'Forum', href: 'https://forum.balancer.fi/' },
    {
      label: 'Grants',
      href: 'https://grants.balancer.community',
    },
  ]

  const getSocialLinks = (size = 24) => [
    {
      icon: <XIcon size={size} />,
      href: 'https://x.com/Balancer',
    },
    {
      icon: <DiscordIcon size={size} />,
      href: ProjectConfigBalancer.externalLinks.discordUrl,
    },
    {
      icon: <MediumIcon size={size} />,
      href: 'https://medium.com/balancer-protocol',
    },
    {
      icon: <YoutubeIcon size={size} />,
      href: 'https://www.youtube.com/channel/UCBRHug6Hu3nmbxwVMt8x_Ow',
    },
    {
      icon: <GithubIcon size={size} />,
      href: 'https://github.com/balancer/',
    },
  ]

  return { appLinks, ecosystemLinks, getSocialLinks }
}
