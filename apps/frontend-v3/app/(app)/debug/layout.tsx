import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'

export default function DebugLayout({ children }: PropsWithChildren) {
  return (
    <DefaultPageContainer width="90%" maxW="90%">
      {children}
    </DefaultPageContainer>
  )
}
