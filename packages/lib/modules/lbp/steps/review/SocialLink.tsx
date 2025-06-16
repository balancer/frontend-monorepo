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
      boxShadow="var(--chakra-shadows-xl)"
      color="font.primary"
      key={href}
      rounded="full"
      size="8"
    >
      <SocialIcon iconType={socialNetwork} size={16} />
    </Circle>
  )

  return (
    <Button as={Link} href={href} isExternal leftIcon={icon}>
      <Text color="font.secondary">{title}</Text>
    </Button>
  )
}
