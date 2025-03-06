import { ToastProps, useToast, ToastId } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

export type StaticToastRenderProps = Parameters<NonNullable<ToastProps['render']>>[0]

export type StaticToastProps = Omit<ToastProps, 'id' | 'children' | 'render' | 'duration'> & {
  isOpen?: boolean
  children?: ToastProps['render']
}

const defaultProps = {
  duration: null,
}

export function StaticToast({ children, isOpen, ...props }: StaticToastProps) {
  const toast = useToast(props)

  const toastIdRef = useRef<ToastId | undefined>(undefined)

  useEffect(() => {
    if (isOpen && !toastIdRef.current) {
      toastIdRef.current = toast({ ...defaultProps, ...props, render: children })
    }

    // close on isOpen change
    if (!isOpen && toastIdRef.current) {
      toast.close(toastIdRef.current)
    }

    return () => {
      // close on isOpen change
      if (!isOpen && toastIdRef.current) {
        toast.close(toastIdRef.current)
        toastIdRef.current = undefined
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    return () => {
      // close on component destroy
      if (toastIdRef.current) {
        toast.close(toastIdRef.current)
        toastIdRef.current = undefined
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (toastIdRef.current) {
      // rerender
      toast.update(toastIdRef.current, { ...defaultProps, ...props, render: children })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  return null
}
