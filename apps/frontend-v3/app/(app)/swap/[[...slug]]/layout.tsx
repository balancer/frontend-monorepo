'use client'

import { PropsWithChildren } from 'react'
import { getSwapPathParams } from '@repo/lib/modules/swap/getSwapPathParams'
import SwapLayout from '@repo/lib/modules/swap/SwapLayout'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { SwapProviderProps } from '@repo/lib/modules/swap/SwapProvider'

type Props = PropsWithChildren<{
  params: { slug?: string[] }
}>

export default function Layout({ params: { slug }, children }: Props) {
  const pathParams = getSwapPathParams(slug)
  const swapProps: SwapProviderProps = {
    pathParams,
  }

  return (
    <DefaultPageContainer minH="100vh">
      <SwapLayout props={swapProps}> {children} </SwapLayout>
    </DefaultPageContainer>
  )
}
