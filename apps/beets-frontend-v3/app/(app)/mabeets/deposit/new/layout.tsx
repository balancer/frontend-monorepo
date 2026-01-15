import { PropsWithChildren } from 'react'
import { RelicDepositProvider } from '@/lib/modules/reliquary/RelicDepositProvider'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type Props = PropsWithChildren

export default async function RelicDepositLayoutWrapper({ children }: Props) {
  return (
    <DefaultPageContainer>
      <RelicDepositProvider>{children}</RelicDepositProvider>
    </DefaultPageContainer>
  )
}
