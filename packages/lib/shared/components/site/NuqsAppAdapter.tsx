'use client'

import { PropsWithChildren } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export function NuqsAppAdapter({ children }: PropsWithChildren) {
  return <NuqsAdapter>{children}</NuqsAdapter>
}
