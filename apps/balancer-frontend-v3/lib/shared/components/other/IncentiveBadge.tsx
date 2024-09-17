import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  CardProps,
  Flex,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react'
import StarsIcon from '../icons/StarsIcon'

type Props = {
  special?: boolean
  label: string
  value: string
} & CardProps

export function IncentiveBadge({ special = false, label, value, children }: Props) {
  return (
    <Accordion allowToggle variant="incentives">
      <AccordionItem border="none">
        <AccordionButton>
          <HStack width="full" zIndex="2" justifyContent="space-between">
            <HStack spacing="4" width="full">
              <Flex
                justifyContent="center"
                alignItems="center"
                rounded="md"
                background="background.level3"
                width="70px"
                height="60px"
                borderWidth={1}
                borderColor="border.base"
                shadow="sm"
              >
                {special && <Icon as={StarsIcon} boxSize="32px" />}
                {!special && (
                  <Icon color="font.secondary" as={StarsIcon} variant="solid" boxSize="28px" />
                )}
              </Flex>
              <HStack
                spacing="2"
                fontWeight="medium"
                alignItems="flex-start"
                justifyContent="space-between"
                width="full"
              >
                <Text fontSize="1.15rem" fontWeight="semibold" variant="primary">
                  {label}
                </Text>
                <HStack>
                  <Text
                    variant={special ? 'specialSecondary' : 'primary'}
                    fontSize="1.15rem"
                    fontWeight="semibold"
                  >
                    {value}
                  </Text>
                  <AccordionIcon />
                </HStack>
              </HStack>
            </HStack>
          </HStack>
        </AccordionButton>
        <AccordionPanel>{children}</AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
