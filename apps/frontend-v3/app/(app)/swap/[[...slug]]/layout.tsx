'use client'

import { PropsWithChildren } from 'react'
import { getSwapPathParams } from '@repo/lib/modules/swap/getSwapPathParams'
import SwapLayout from '../../../../../../packages/lib/modules/swap/SwapLayout'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type Props = PropsWithChildren<{
  params: { slug?: string[] }
}>

export default function Layout({ params: { slug }, children }: Props) {
  const pathParams = getSwapPathParams(slug)

  return (
    <DefaultPageContainer minH="100vh">
      <SwapLayout pathParams={pathParams}> {children} </SwapLayout>
    </DefaultPageContainer>
  )
}
