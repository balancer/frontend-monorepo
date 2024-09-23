import { usePathname } from 'next/navigation'
import { XIcon } from '../icons/social/XIcon'
import { DiscordIcon } from '../icons/social/DiscordIcon'
import { MediumIcon } from '../icons/social/MediumIcon'
import { YoutubeIcon } from '../icons/social/YoutubeIcon'
import { GithubIcon } from '../icons/social/GithubIcon'
import { useParams } from 'next/navigation'
import { isDev, isStaging } from '@/lib/config/app.config'

export function useNav() {
  const pathname = usePathname()

  const { chain } = useParams()
  const swapHref = chain ? '/swap/' + chain : '/swap'

  const appLinks = [
    {
      href: '/pools',
      label: 'Pools',
    },
    {
      href: swapHref,
      label: 'Swap',
    },
    {
      href: '/portfolio',
      label: 'Portfolio',
    },
  ]

  // To-do: Remove this when veBAL is live
  if (isDev || isStaging) {
    appLinks.push({
      href: '/vebal',
      label: 'veBAL (wip)',
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
      href: 'https://discord.balancer.fi/',
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

  function linkColorFor(path: string) {
    return pathname === path ? 'font.highlight' : 'font.primary'
  }

  return { appLinks, ecosystemLinks, getSocialLinks, linkColorFor }
}
