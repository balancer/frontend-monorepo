import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function PoolsPreloadHints() {
  const promoImagePreloads = (PROJECT_CONFIG.promoItems ?? []).flatMap(item =>
    item.bgImageActive
      ? [
          <link
            as="image"
            href={`${item.bgImageActive.directory}${item.bgImageActive.imgName}-dark.avif`}
            key={`${item.id}-avif`}
            rel="preload"
            type="image/avif"
          />,
          <link
            as="image"
            href={`${item.bgImageActive.directory}${item.bgImageActive.imgName}-dark.png`}
            key={`${item.id}-png`}
            rel="preload"
            type="image/png"
          />,
        ]
      : []
  )

  return (
    <>
      {promoImagePreloads}
      <link
        as="image"
        href="/images/homepage/stone-dark.avif"
        key="stone-dark-avif"
        rel="preload"
        type="image/avif"
      />
    </>
  )
}
