import { PropsWithChildren } from 'react'
import { Card, CardProps } from '@chakra-ui/react'

const wrapperBoxShadowStyles = [
  '0px 0px 0px 1px rgba(0, 0, 0, 0.05)',
  '1px 1px 1px -0.5px rgba(0, 0, 0, 0.15)',
  '3px 3px 3px -1.5px rgba(0, 0, 0, 0.15)',
  '6px 6px 6px -3px rgba(0, 0, 0, 0.26)',
  '-0.5px -1px 0px 0px rgba(255, 255, 255, 0.38)',
].join(', ')

export function VotingDeadlineContainer({
  children,
  ...stackProps
}: PropsWithChildren & CardProps) {
  return (
    <Card
      bg="background.level1"
      boxShadow={wrapperBoxShadowStyles}
      p={{ base: 'ms', lg: '20px' }}
      rounded="xl"
      {...stackProps}
    >
      {children}
    </Card>
  )
}
