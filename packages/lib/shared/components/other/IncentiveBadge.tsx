import { Accordion, CardProps, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import StarsIcon from '../icons/StarsIcon'

type Props = {
  special?: boolean
  label: string
  value: string
} & CardProps

export function IncentiveBadge({ special = false, label, value, children }: Props) {
  return (
    <Accordion.Root collapsible variant="incentives">
      <Accordion.Root border="none" value='item-0'>
        <Accordion.Root>
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
                justifyContent="space-between"
                gap="2"
                width="full"
              >
                <Text fontSize="1.15rem" fontWeight="semibold" variant="primary">
                  {label}
                </Text>
                <HStack>
                  <Text
                    fontSize="1.15rem"
                    fontWeight="semibold"
                    variant={special ? 'specialSecondary' : 'primary'}
                  >
                    {value}
                  </Text>
                  <Accordion.Root />
                </HStack>
              </HStack>
            </HStack>
          </HStack>
        </Accordion.ItemTrigger>
        <Accordion.Root><Accordion.Root>{children}</Accordion.ItemBody></Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
}
