import { useToast as useChakraToast } from '@chakra-ui/react'
import { ReactNode } from 'react'

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

interface ToastOptions {
  id: string
  type: ToastType
  content: ReactNode
  auto?: boolean
}

export function useToast() {
  const toast = useChakraToast()

  const showToast = ({ id, type, content, auto }: ToastOptions) => {
    toast({
      id,
      title: content,
      status: type,
      duration: auto ? 5000 : null,
      isClosable: true,
    })
  }

  return { showToast }
}
