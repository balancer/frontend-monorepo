'use client'

import { Toaster } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { toaster } from './toaster'
import { ToastRenderProps, ToastStatus } from '../../hooks/useToast'

export function BalToaster() {
  return (
    <Toaster toaster={toaster}>
      {toast => {
        const renderFn = toast.meta?.render as ((props: ToastRenderProps) => ReactNode) | undefined
        if (renderFn) {
          return renderFn({
            id: (toast.id ?? '') as string,
            status: toast.type as ToastStatus,
            title: toast.title as ReactNode,
            description: toast.description as ReactNode,
            isClosable: (toast.meta?.isClosable ?? toast.closable) as boolean | undefined,
            onClose: () => toaster.dismiss(toast.id ?? ''),
          })
        }
        return null
      }}
    </Toaster>
  )
}
