import { Accordion, CardRootProps, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import StarsIcon from '../icons/StarsIcon'

type Props = {
  special?: boolean
  label: string
  value: string
} & CardRootProps

export function IncentiveBadge({ special = false, label, value, children }: Props) {
  return (
    <Accordion.Root collapsible variant="incentives">
      <Accordion.Item border="none" value="item-0">
        <Accordion.ItemTrigger>
          <HStack justifyContent="space-between" width="full" zIndex="2">
            <HStack gap="4" width="full">
              <Flex
                alignItems="center"
                background="background.level3"
                borderColor="border.base"
                borderWidth={1}
                height="60px"
                justifyContent="center"
                rounded="md"
                shadow="sm"
                width="70px"
              >
                {special && <Icon as={StarsIcon} boxSize="32px" />}
                {!special && (
                  <Icon as={StarsIcon} boxSize="28px" color="font.secondary" variant="solid" />
                )}
              </Flex>
              <HStack
                alignItems="flex-start"
                fontWeight="medium"
                gap="2"
                justifyContent="space-between"
                width="full"
              >
                <Text fontSize="1.15rem" fontWeight="semibold">
                  {label}
                </Text>
                <HStack>
                  <Text
                    fontSize="1.15rem"
                    fontWeight="semibold"
                    variant={special ? 'specialSecondary' : undefined}
                  >
                    {value}
                  </Text>
                  <Accordion.ItemIndicator />
                </HStack>
              </HStack>
            </HStack>
          </HStack>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <Accordion.ItemBody>{children}</Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  )
}
