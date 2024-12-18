import { LinkSection } from '@repo/lib/shared/components/navs/footer.types'

export function useFooterData() {
  const linkSections: LinkSection[] = [
    {
      title: 'Build on Beets',
      links: [
        { label: 'Home', href: '/' },

        { label: 'Docs', href: 'https://docs.beets.fi', isExternal: true },
        {
          label: 'Prototype on v3',
          href: 'https://github.com/balancer/scaffold-balancer-v3',
          isExternal: true,
        },
      ],
    },
    {
      title: 'Use Beets protocol',
      links: [
        { label: 'Explore pools', href: '/pools' },
        { label: 'Swap tokens', href: '/swap' },
        { label: 'View portfolio', href: '/portfolio' },
        { label: 'Get maBEETS', href: 'https://ma.beets.fi', isExternal: true },
      ],
    },
    {
      title: 'Ecosystem',
      links: [
        { label: 'Governance', href: 'https://snapshot.org/#/beets.eth', isExternal: true },
        {
          label: 'Bug bounties',
          href: 'https://immunefi.com/bug-bounty/balancer',
          isExternal: true,
        },
        { label: 'Analytics', href: 'https://beets.defilytica.com', isExternal: true },
      ],
    },
  ]

  const legalLinks = [{ label: 'Terms of use', href: '/terms-of-use' }]

  return { linkSections, legalLinks }
}
