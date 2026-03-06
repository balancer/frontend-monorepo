'use client'

import { Button } from '@chakra-ui/react'
import { ThumbsUp } from 'react-feather'
import { useAppzi } from '@repo/lib/shared/hooks/useAppzi'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'

export function UserFeedback() {
  const { openNpsModal } = useAppzi()

  const handleFeedbackClick = () => {
    trackEvent(AnalyticsEvent.ClickNavUtilitiesFeedback)
    openNpsModal()
  }

  return (
    <Button onClick={handleFeedbackClick} p="0" variant="tertiary">
      <ThumbsUp size={18} />
    </Button>
  )
}
