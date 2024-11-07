import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'

export default async function VeBALLayout({ children }: PropsWithChildren) {
  return <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
}
