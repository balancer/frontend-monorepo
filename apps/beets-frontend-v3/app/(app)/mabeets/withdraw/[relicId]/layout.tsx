import { PropsWithChildren } from 'react'
import { RelicWithdrawProvider } from '@/lib/modules/reliquary/RelicWithdrawProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PermitSignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/PermitSignatureProvider'

type Props = PropsWithChildren<{
  params: { relicId: string }
}>

export default async function RelicWithdrawLayoutWrapper({ params, children }: Props) {
  const relicId = await params.relicId
  return (
    <DefaultPageContainer>
      <PermitSignatureProvider>
        <RelicWithdrawProvider relicId={relicId}>
          <PriceImpactProvider>{children}</PriceImpactProvider>
        </RelicWithdrawProvider>
      </PermitSignatureProvider>
    </DefaultPageContainer>
  )
}
