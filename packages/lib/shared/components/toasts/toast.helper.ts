import { CreateToastFnReturn } from '@chakra-ui/react'
import { ErrorCause } from '../../utils/errors'

export function showErrorAsToast(toast: CreateToastFnReturn, cause: ErrorCause) {
  if (!toast.isActive(cause.id)) {
    toast({
      id: cause.id,
      title: cause.title,
      description: cause.description,
      status: 'error',
      duration: 300000,
      isClosable: true,
    })
  }
}
