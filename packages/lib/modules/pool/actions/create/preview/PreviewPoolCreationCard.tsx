import { Card } from '@chakra-ui/react'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'

type Props = {
  children: React.ReactNode
  stepTitle: string
}

export function PreviewPoolCreationCard({ children, stepTitle }: Props) {
  const { isBeforeStep, isStep } = usePoolCreationFormSteps()
  return (
    <Card
      bg={isStep(stepTitle) ? 'background.specialAlpha15' : 'background.level2'}
      borderColor={isStep(stepTitle) ? 'border.special' : 'transparent'}
      opacity={isBeforeStep(stepTitle) ? 0.5 : 1}
    >
      {children}
    </Card>
  )
}
