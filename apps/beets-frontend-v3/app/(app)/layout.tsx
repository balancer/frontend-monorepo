import { PropsWithChildren } from 'react'
import { BaseLayout } from '../layouts/base-layout'

export default function AppLayout({ children }: PropsWithChildren) {
  return <BaseLayout>{children}</BaseLayout>
}
