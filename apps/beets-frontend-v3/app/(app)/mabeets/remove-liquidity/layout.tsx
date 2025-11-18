'use client'

import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  params: { txHash?: string[] }
}>

export default function RemoveLiquidityLayoutWrapper({ children }: Props) {
  return <>{children}</>
}
