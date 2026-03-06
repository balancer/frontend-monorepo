'use client'

import { Button, VStack } from '@chakra-ui/react'
import { useToast } from '@repo/lib/shared/hooks/useToast'
import { useDisclosure } from '@chakra-ui/react'
import { StaticToast, StaticToastRenderProps } from '@repo/lib/shared/components/toasts/StaticToast'
import { useCurrentDate } from '@repo/lib/shared/hooks/date.hooks'
import { Toast } from '@repo/lib/shared/components/toasts/Toast'

function ToastRender({ id, title, isClosable, onClose }: StaticToastRenderProps) {
  return <Toast id={id} isClosable={isClosable} onClose={onClose} title={title} />
}

const start = Date.now()

export default function Page() {
  const { open, onOpen, onClose } = useDisclosure()
  const now = Number(useCurrentDate(100))

  const showToast = useToast()

  return (
    <VStack width="full">
      <StaticToast
        isClosable
        isOpen={open}
        onClose={onClose}
        title={`Toast Text (${((now - start) / 1000).toFixed(1)})`}
      >
        {ToastRender}
      </StaticToast>

      <Button onClick={open ? onClose : onOpen}>
        {open ? 'Close Static Toast' : 'Open Static Toast'}
      </Button>

      <Button
        onClick={() => showToast({ title: 'Basic toast', render: props => <Toast {...props} /> })}
      >
        Show basic toast
      </Button>
    </VStack>
  )
}
