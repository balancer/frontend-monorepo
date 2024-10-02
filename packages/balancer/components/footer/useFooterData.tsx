type LinkSection = {
  title: string
  links: { href: string; label: string; isExternal?: boolean }[]
}

export function useFooterData() {
  const linkSections: LinkSection[] = [
    {
      title: 'Build on Balancer',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Balancer v3', href: '/build/v3' },

        { label: 'v3 Docs', href: 'https://docs-v3.balancer.fi', isExternal: true },
        {
          label: 'Prototype on v3',
          href: 'https://github.com/balancer/scaffold-balancer-v3',
          isExternal: true,
        },
        { label: 'Grants', href: 'https://grants.balancer.community', isExternal: true },
        { label: 'v2 Docs', href: 'https://docs.balancer.fi', isExternal: true },
      ],
    },
    {
      title: 'Use Balancer protocol',
      links: [
        { label: 'Explore pools', href: '/pools' },
        { label: 'Swap tokens', href: '/swap' },
        { label: 'View portfolio', href: '/portfolio' },
        { label: 'Get veBAL', href: 'https://app.balancer.fi/#/vebal', isExternal: true },
        {
          label: 'Create an LBP',
          href: 'https://www.fjordfoundry.com/?utm_source=balancer&utm_medium=website',
          isExternal: true,
        },
        {
          label: 'Create an NFT drop',
          href: 'https://fjordnfts.com/?utm_source=balancer&utm_medium=website',
          isExternal: true,
        },
      ],
    },
    {
      title: 'Ecosystem',
      links: [
        { label: 'Forum', href: 'https://forum.balancer.fi', isExternal: true },
        { label: 'Governance', href: 'https://vote.balancer.fi', isExternal: true },
        {
          label: 'Bug bounties',
          href: 'https://immunefi.com/bug-bounty/balancer',
          isExternal: true,
        },
        { label: 'Dune Analytics', href: 'https://dune.com/balancer', isExternal: true },
        { label: 'Defilytica', href: 'https://balancer.defilytica.com', isExternal: true },
        {
          label: 'Brand assets',
          href: 'https://github.com/balancer/brand-assets',
          isExternal: true,
        },
      ],
    },
  ]

  const legalLinks = [
    { label: 'Terms of use', href: '/terms-of-use' },
    { label: 'Privacy policy', href: '/privacy-policy' },
    { label: 'Cookies policy', href: '/cookies-policy' },
    { label: '3rd party services', href: '/3rd-party-services' },
    { label: 'Risks', href: '/risks' },
  ]

  return { linkSections, legalLinks }
}
