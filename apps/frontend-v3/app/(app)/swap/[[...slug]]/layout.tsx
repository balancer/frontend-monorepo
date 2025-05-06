'use client'

import { PropsWithChildren, use } from 'react'
import { getSwapPathParams } from '@repo/lib/modules/swap/getSwapPathParams'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { SwapProviderProps } from '@repo/lib/modules/swap/SwapProvider'

type Props = PropsWithChildren<{
  params: Promise<{ slug?: string[] }>
}>

export default function Layout({ params, children }: Props) {
  const resolvedParams = use(params)
  const pathParams = getSwapPathParams(resolvedParams.slug)
  const swapProps: SwapProviderProps = {
    pathParams,
  }

  return (
    <DefaultPageContainer minH="100vh">
      <SwapLayout props={swapProps}> {children} </SwapLayout>
    </DefaultPageContainer>
  )
}
