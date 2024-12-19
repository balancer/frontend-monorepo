import {
  Box,
  Card,
  CardHeader,
  HStack,
  Heading,
  CardBody,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react'

const FAQ_ITEMS = [
  {
    question: 'What is stS?',
    answer:
      'stS is a liquid-staked token that users receive when they stake S on the Beets platform. The value of stS naturally appreciates in relation to S thanks to native network staking rewards from validator delegation being automatically compounded within the token.',
  },
  {
    question: 'What are the stS fees?',
    answer:
      'Due to the management of underlying nodes, validators earn 15% of the overall stS staking rewards. Beets also takes a 10% protocol fee on the rewards after the validator fees. The APY displayed on the UI is the APY the user receives (all fees have been subtracted automatically).',
  },
  {
    question: 'How do I get stS tokens?',
    answer:
      'To stake, users simply need to head to the stS page and select how much S they wish to deposit. As an alternative to staking, users can swap out of stS on DEXs by swapping their stS for S on the Swap Page.',
  },
  {
    question: 'How do I unstake stS for S?',
    answer:
      'Unstaking stS involves a 14-day unbonding period aligned with staking on Sonic. After initiating the unstake, users will need to return to the UI after 14 days to claim S. For instant liquidity, users can swap stS for S directly on DEXs via the Swap Page. However, note that swapping may offer a less favorable exchange rate than unstaking, depending on the pool’s liquidity.',
  },
  {
    question: 'Where can I use stS tokens?',
    answer:
      'stS is fully liquid, meaning you can use stS seamlessly across DeFi and access lending markets, liquidity pools, and more without pausing your rewards.',
  },
]

export function LstFaq() {
  return (
    <Card rounded="xl" w="full">
      <CardHeader as={HStack} justify="space-between" w="full">
        <Heading as="h2" size="lg">
          FAQ
        </Heading>
      </CardHeader>
      <CardBody align="start" as={VStack} />
      <Accordion allowToggle variant="button">
        {FAQ_ITEMS.map(item => (
          <AccordionItem key={item.question}>
            <h2>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  {item.question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb="md">{item.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  )
}
