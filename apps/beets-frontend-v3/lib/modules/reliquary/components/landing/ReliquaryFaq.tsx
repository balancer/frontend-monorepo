import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'

const FAQ_COLUMN_1 = [
  {
    question: 'What is maBEETS?',
    answer:
      "maBEETS (Maturity Adjusted BEETS) is Beets' governance system, where voting power and rewards scale with how long a position is held — without fixed lock-ups.",
  },
  {
    question: 'How is maBEETS different from ve-models?',
    answer:
      'Unlike typical ve-models, maBEETS does not require locking tokens for a set period. Positions can be exited at any time, with voting power and rewards increasing gradually through maturity.',
  },
  {
    question: 'What is maturity and how does it work?',
    answer:
      'Maturity reflects how long a maBEETS position has been held. As maturity increases over time, so do voting power and the share of governance-aligned rewards.',
  },
  {
    question: 'Can I exit my maBEETS position at any time?',
    answer:
      'Yes. Positions are fully liquid and can be exited at any time, though exiting resets accumulated maturity.',
  },
]

const FAQ_COLUMN_2 = [
  {
    question: 'What do I receive when I create a maBEETS position?',
    answer:
      'You receive a maBEETS position NFT that represents your maBEETS position and tracks maturity, voting power, and reward share.',
  },
  {
    question: 'How do maBEETS rewards work?',
    answer:
      'Rewards are earned by holding a maBEETS position, with additional incentives available through governance participation such as gauge voting.',
  },
  {
    question: 'What is the "vote optimizer"?',
    answer:
      'Activating the vote optimizer delegates your maBEETS voting power —specifically within the Beets Gauge Votes space— to the Music Directors. They vote on your behalf with a clear goal: maximizing value for you through higher voting incentives, while also strengthening the protocol with increased staking rewards for a core pool. Your ownership, maturity progression, rewards, and exit rights stay exactly the same.',
  },
  {
    question: 'What happens if I transfer or sell my maBEETS NFT?',
    answer:
      "The NFT carries the position's maturity and voting power with it, meaning these transfer to the new holder.",
  },
]

export function ReliquaryFaq() {
  return (
    <VStack alignItems="flex-start" spacing="4" width="full">
      <HStack
        borderBottom="1px solid"
        borderColor="border.base"
        justify="space-between"
        pb="3"
        w="full"
      >
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          FAQ
        </Text>
        <Link
          color="#05D690"
          href="https://docs.beets.fi/tokenomics/mabeets"
          isExternal
          textDecoration="underline"
        >
          Learn more
        </Link>
      </HStack>
      <Box h="400px" w="full">
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="8" h="full" w="full">
          <Accordion allowToggle w="full">
            {FAQ_COLUMN_1.map(item => (
              <AccordionItem
                bg="transparent"
                borderBottom="1px solid"
                borderColor="border.base"
                borderTop="none"
                key={item.question}
                py="3"
              >
                <h2>
                  <AccordionButton _hover={{ bg: 'transparent' }} px="0">
                    <Box as="span" flex="1" textAlign="left">
                      {item.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb="md" px="0">
                  <Text color="font.primary" fontSize="lg" fontWeight="thin">
                    {item.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <Accordion allowToggle w="full">
            {FAQ_COLUMN_2.map(item => (
              <AccordionItem
                bg="transparent"
                borderBottom="1px solid"
                borderColor="border.base"
                borderTop="none"
                key={item.question}
                py="3"
              >
                <h2>
                  <AccordionButton _hover={{ bg: 'transparent' }} px="0">
                    <Box as="span" flex="1" textAlign="left">
                      {item.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb="md" px="0">
                  <Text color="font.primary" fontSize="lg" fontWeight="thin">
                    {item.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </SimpleGrid>
      </Box>
    </VStack>
  )
}
