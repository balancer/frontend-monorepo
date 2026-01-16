import ReliquaryProvidersLayout from '@/lib/modules/reliquary/ReliquaryProvidersLayout'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { BaseVariant } from '@repo/lib/modules/pool/pool.types'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PoolLayout } from '@repo/lib/shared/layouts/PoolLayout'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

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
        <DefaultPageContainer
          backgroundImage="url('/images/reliquary/bg.png')"
          backgroundPosition="top"
          backgroundRepeat="no-repeat"
          backgroundSize="contain"
        >
          {children}
        </DefaultPageContainer>
      </ReliquaryProvidersLayout>
    </PoolLayout>
  )
}
