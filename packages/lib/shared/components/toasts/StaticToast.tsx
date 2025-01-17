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
      // open
      toastIdRef.current = toast({ ...defaultProps, ...props, render: children })
    }

    if (!isOpen && toastIdRef.current) {
      // close on isOpen change
      toast.close(toastIdRef.current)
    }

    return () => {
      if (!isOpen && toastIdRef.current) {
        // close on isOpen change
        toast.close(toastIdRef.current)
        toastIdRef.current = undefined
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (toastIdRef.current) {
      // rerender
      toast.update(toastIdRef.current, { ...defaultProps, ...props, render: children })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  return null
}
