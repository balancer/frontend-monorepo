import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type Props = PropsWithChildren<{
  params: Promise<{ relicId?: string }>
}>

export default async function RelicDepositLayoutWrapper({ params, children }: Props) {
  const { relicId } = await params

  return (
    <DefaultPageContainer>
      <RelicDepositProvider relicId={relicId}>{children}</RelicDepositProvider>
    </DefaultPageContainer>
  )
}
