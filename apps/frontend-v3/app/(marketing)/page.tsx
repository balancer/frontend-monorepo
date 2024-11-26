import { LandingV3 } from '@repo/lib/modules/marketing/landing-v3/LandingV3'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <link href="/images/bgs/zenbg-1.webp" rel="prefetch" />
        <link href="/images/bgs/zenbg-2.webp" rel="prefetch" />
        <link href="/images/bgs/zenbg-3.webp" rel="prefetch" />
        <link href="/images/bgs/zenbg-4.webp" rel="prefetch" />
      </Head>
      <LandingV3 />
    </>
  )
}
