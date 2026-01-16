import { PropsWithChildren } from 'react'
import { RelicWithdrawProvider } from '@/lib/modules/reliquary/RelicWithdrawProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PermitSignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/PermitSignatureProvider'

type Props = PropsWithChildren<{
  params: Promise<{ relicId: string }>
}>

export default async function RelicWithdrawLayoutWrapper({ params, children }: Props) {
  const { relicId } = await params

  return (
    <DefaultPageContainer>
      <PermitSignatureProvider>
        <RelicWithdrawProvider relicId={relicId}>{children}</RelicWithdrawProvider>
      </PermitSignatureProvider>
    </DefaultPageContainer>
  )
}
