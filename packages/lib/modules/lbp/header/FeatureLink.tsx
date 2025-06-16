import { Circle, HStack, Text, Tooltip } from '@chakra-ui/react'

type Props = {
  title: string
  description: string
}

export function FeatureLink({ title, description }: Props) {
  return (
    <HStack spacing={4}>
      <Circle
        bgImage="url(/images/textures/marble-square-dark.jpg)"
        color="font.secondary"
        shadow="lg"
        size={24}
      ></Circle>
      <Tooltip
        bg="background.level3"
        color="font.secondary"
        hasArrow
        label={description}
        placement="top"
      >
        <Text
          _hover={{ color: 'var(--chakra-colors-font-primary)' }}
          cursor="pointer"
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
  )
}
