import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'

export default function DebugLayout({ children }: PropsWithChildren) {
  return (
    <DefaultPageContainer maxW="90%" width="90%">
      {children}
    </DefaultPageContainer>
  )
}
