import { PropsWithChildren } from 'react'
import { Card, CardProps } from '@chakra-ui/react'

export function VotingDeadlineContainer({
  children,
  ...stackProps
}: PropsWithChildren & CardProps) {
  return (
    <Card
      bg="background.level1"
      p={{ base: 'ms', md: 'md', lg: '20px' }}
      rounded="md"
      shadow="xl"
      {...stackProps}
    >
      {children}
    </Card>
  )
}
