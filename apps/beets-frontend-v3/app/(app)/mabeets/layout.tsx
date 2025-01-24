import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

export const metadata: Metadata = {
  title: 'maBEETS',
  description: `
   Text
  `,
}

export default async function Pools({ children }: PropsWithChildren) {
  return <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
}
