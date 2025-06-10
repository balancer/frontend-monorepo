import { Button, Circle, Link, Text } from '@chakra-ui/react'
import { IconType, SocialIcon } from '@repo/lib/shared/components/navs/SocialIcon'

export function SocialLink({
  title,
  socialNetwork,
  href,
}: {
  title: string
  socialNetwork: IconType
  href: string
}) {
  const icon = (
    <Circle
      bg="background.level4"
      key={href}
      rounded="full"
      size="8"
      color="font.primary"
      boxShadow="var(--chakra-shadows-xl)"
    >
      <SocialIcon iconType={socialNetwork} size={16} />
    </Circle>
  )

  return (
    <Button leftIcon={icon} as={Link} href={href} isExternal>
      <Text color="font.secondary">{title}</Text>
    </Button>
  )
}
