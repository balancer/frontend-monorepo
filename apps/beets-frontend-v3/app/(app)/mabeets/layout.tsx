import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import ReliquaryProvidersLayout from '@/lib/modules/reliquary/ReliquaryProvidersLayout'
import { PoolLayout } from '@repo/lib/shared/layouts/PoolLayout'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { BaseVariant } from '@repo/lib/modules/pool/pool.types'

export const metadata: Metadata = {
  title: 'maBEETS',
  description: `
   Text
  `,
}

export default async function Pools({ children }: PropsWithChildren) {
  return (
    <PoolLayout chain={ChainSlug.Sonic} id={PROJECT_CONFIG.corePoolId} variant={BaseVariant.v2}>
      <ReliquaryProvidersLayout>
        <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
      </ReliquaryProvidersLayout>
    </PoolLayout>
  )
}
