import { HStack, Text } from '@chakra-ui/react';
import { Tooltip } from '../../../shared/components/tooltips/Tooltip'
import { StoneIcon } from '@repo/lib/shared/components/StoneIcon'
import { ReactElement } from 'react'

type Props = {
  title: string
  icon: ReactElement
  description: string
  transformBackground?: string
}

export function FeatureLink({ title, description, icon, transformBackground }: Props) {
  return (
    <HStack gap={4}>
      <StoneIcon icon={icon} sparkleSize={41} transformBackground={transformBackground} />
      <Tooltip
        bg="background.level3"
        color="font.maxContrast"
        showArrow
        content={description}
        lineHeight="short"
        p="ms"
        shadow="2xl"
        positioning={{
          placement: "top"
        }}
      >
        <Text
          _hover={{ color: 'var(--chakra-colors-font-primary)' }}
          cursor="pointer"
          fontSize="sm"
          maxW={{ base: 'full', md: '10ch' }}
          mb="1.5"
          textDecoration="underline"
          textDecorationStyle="dotted"
          textDecorationThickness="1px"
          textUnderlineOffset="3px"
          variant="secondary"
          zIndex="docked"
        >
          {title}
        </Text>
      </Tooltip>
    </HStack>
  );
}
