import { Circle, Link, HStack, Text } from '@chakra-ui/react'
import { IconType, SocialIcon as Icon } from '@repo/lib/shared/components/navs/SocialIcon'

function SocialIcon({ socialNetwork }: { socialNetwork: IconType }) {
  return (
    <Circle
      bg="background.level4"
      boxShadow="var(--chakra-shadows-xl)"
      color="inherit"
      rounded="full"
      size="8"
    >
      <Icon iconType={socialNetwork} size={16} />
    </Circle>
  )
}

export function SocialLink({
  title,
  socialNetwork,
  href,
}: {
  title: string
  socialNetwork: IconType
  href: string
}) {
  return (
    <Link _hover={{ color: 'font.linkHover' }} color="font.link" href={href} isExternal>
      <HStack>
        <SocialIcon socialNetwork={socialNetwork} />
        <Text color="inherit">{title}</Text>
      </HStack>
    </Link>
  )
}
