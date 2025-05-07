import { Card, HStack, Text, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface HeaderCardProps {
  variant?: 'default' | 'special' | 'expired'
  headerText: string
  leftContent?: ReactNode
  rightContent?: ReactNode
}

const cardSpecialStyles = {
  position: 'relative',
  background:
    'linear-gradient(89.81deg, rgba(179, 174, 245, 0.12) -1.06%, rgba(215, 203, 231, 0.12) 27.62%, rgba(229, 200, 200, 0.12) 49.42%, rgba(234, 168, 121, 0.12) 98.68%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    padding: '1px',
    borderRadius: 'inherit',
    background: 'background.special',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
}

const cardExpiredStyles = {
  background:
    'radial-gradient(123.13% 233.05% at 50% 50%, rgba(244, 137, 117, 0) 0%, rgba(244, 137, 117, 0.15) 100%)',
}

function getCardProps(variant: HeaderCardProps['variant']) {
  switch (variant) {
    case 'special':
      return {
        sx: cardSpecialStyles,
      }
    case 'expired':
      return {
        sx: cardExpiredStyles,
      }
    default:
      return {}
  }
}

export function MyVotesStatsCard({
  headerText,
  variant = 'default',
  leftContent,
  rightContent,
}: HeaderCardProps) {
  const cardProps = getCardProps(variant)
  return (
    <Card h="full" w="full" {...cardProps}>
      <VStack align="start" h="full" justifyContent="space-between" spacing="ms" w="full">
        <Text fontSize="sm" variant="secondary">
          {headerText}
        </Text>
        <HStack
          alignItems="center"
          justifyContent="space-between"
          minHeight="36px"
          spacing="sm"
          w="full"
        >
          {leftContent || <Text color="font.maxContrast">&mdash;</Text>}
          {rightContent}
        </HStack>
      </VStack>
    </Card>
  )
}
