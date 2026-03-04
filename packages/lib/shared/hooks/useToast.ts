import { ReactNode } from 'react'
import { toaster } from '../components/toasts/toaster'

export type ToastId = string
export type ToastStatus = 'info' | 'warning' | 'success' | 'error' | 'loading'

export interface ToastRenderProps {
  id: ToastId
  status?: ToastStatus
  title?: ReactNode
  description?: ReactNode
  isClosable?: boolean
  onClose?: () => void
}

export interface ToastOptions {
  id?: string
  title?: ReactNode
  description?: ReactNode
  status?: ToastStatus
  duration?: number | null
  isClosable?: boolean
  render?: (props: ToastRenderProps) => ReactNode
}

// v2 compat: ToastProps is what render callbacks receive
export type ToastProps = ToastRenderProps & {
  render?: (props: ToastRenderProps) => ReactNode
}

export type UseToastReturn = {
  (options: ToastOptions): ToastId
  close: (id: ToastId) => void
  closeAll: () => void
  update: (id: ToastId, options: ToastOptions) => void
  isActive: (id: ToastId) => boolean
}

// Track active toast IDs (toaster is a singleton so this is global)
const activeIds = new Set<string>()

export function useToast(): UseToastReturn {
  const toast = (options: ToastOptions): ToastId => {
    const { title, description, status = 'info', duration, isClosable, render, id } = options
    // duration: null in v2 = persist forever. Map to very large number in v3.
    const v3Duration = duration === null ? 9999999 : duration
    const createdId = toaster.create({
      id,
      title: title as string,
      description: description as string,
      type: status,
      duration: v3Duration,
      closable: isClosable,
      meta: { render, isClosable },
    })
    activeIds.add(createdId)
    return createdId
  }

  toast.close = (id: ToastId) => {
    toaster.dismiss(id)
    activeIds.delete(id)
  }

  toast.closeAll = () => {
    toaster.dismiss()
    activeIds.clear()
  }

  toast.update = (id: ToastId, options: ToastOptions) => {
    const { title, description, status, duration, isClosable, render } = options
    const v3Duration = duration === null ? 9999999 : duration
    toaster.update(id, {
      title: title as string,
      description: description as string,
      type: status,
      duration: v3Duration,
      closable: isClosable,
      meta: { render, isClosable },
    })
  }

  toast.isActive = (id: ToastId): boolean => {
    return activeIds.has(id)
  }

  return toast
}

// v2 compat type alias
export type CreateToastFnReturn = UseToastReturn
