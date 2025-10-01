'use client'

import { Button } from '@chakra-ui/react'
import { ThumbsUp } from 'react-feather'
import { useAppzi } from '@repo/lib/shared/hooks/useAppzi'

export function UserFeedback() {
  const { openNpsModal } = useAppzi()

  return (
    <Button onClick={openNpsModal} p="0" variant="tertiary">
      <ThumbsUp size={18} />
    </Button>
  )
}
