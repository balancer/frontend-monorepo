'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { PropsWithChildren } from 'react'

export default function LstLayout({ children }: PropsWithChildren) {
  return <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
}
