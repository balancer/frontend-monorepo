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
        label={description}
        placement="top"
        hasArrow
        bg="background.level3"
        color="font.secondary"
      >
        <Text
          mb="1.5"
          textDecoration="underline"
          textDecorationStyle="dotted"
          textDecorationThickness="1px"
          textUnderlineOffset="3px"
          variant="secondary"
          _hover={{ color: 'var(--chakra-colors-font-primary)' }}
          cursor="pointer"
          zIndex="docked"
        >
          {title}
        </Text>
      </Tooltip>
    </HStack>
  )
}
