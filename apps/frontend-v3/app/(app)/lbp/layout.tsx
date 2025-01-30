import { PropsWithChildren } from 'react'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { isProd } from '@repo/lib/config/app.config'
import { redirect } from 'next/navigation'

export default function LBPCreateLayout({ children }: PropsWithChildren) {
  if (isProd) redirect('/')

  return <DefaultPageContainer minH="100vh">{children}</DefaultPageContainer>
}
