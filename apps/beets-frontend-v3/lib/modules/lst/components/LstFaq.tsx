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
  Text,
  Link,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

const FAQ_ITEMS = [
  {
    question: 'What is stS?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        stS is a liquid-staked token that users receive when they stake $S on the Beets platform.
        The value of stS naturally appreciates in relation to $S thanks to native network staking
        rewards from validator delegation being automatically compounded within the token.
      </Text>
    ),
  },
  {
    question: 'What are the stS fees?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Due to the management of underlying nodes, validators earn 15% of the overall stS staking
        rewards. Beets also takes a 10% protocol fee on the rewards after the validator fees. The
        APY displayed on the UI is the APY the user receives (all fees have been subtracted
        automatically).
      </Text>
    ),
  },
  {
    question: 'How do I get stS tokens?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        To stake, users simply need to head to the stS page and select how much $S they wish to
        deposit. As an alternative to staking, users can swap into stS on DEXs by swapping their $S
        for stS on the Swap Page.
      </Text>
    ),
  },
  {
    question: 'How do I unstake stS for $S?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Unstaking stS involves a 14-day unbonding period aligned with staking on Sonic. After
        initiating the unstake, users will need to return to the UI after 14 days to claim $S. For
        instant liquidity, users can swap stS for $S directly on DEXs via the Swap Page. However,
        note that swapping may offer a less favorable exchange rate than unstaking, depending on the
        pool’s liquidity.
      </Text>
    ),
  },
  {
    question: 'Where can I use stS tokens?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        stS is fully liquid, meaning you can use stS seamlessly across DeFi and access lending
        markets, liquidity pools, and more without pausing your rewards.
      </Text>
    ),
  },
  {
    question: 'What is the stS exchange rate and how does it change?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        The stS token accrues staking rewards via delegating the underlying $S to trustworthy
        validators on the network. Every time staking rewards are added to the pool, the stS
        exchange rate to $S increases.
      </Text>
    ),
  },
  {
    question:
      'What steps have been taken to ensure the security and reliability of the stS smart contract code?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        To mitigate smart contract risks, the stS code has been thoroughly audited by leading
        security firms, including{' '}
        <Link
          alignItems="center"
          display="inline-flex"
          href="https://github.com/spearbit/portfolio/blob/master/pdfs/Beethoven-Sonic-Staking-Spearbit-Security-Review-December-2024.pdf"
          target="_blank"
        >
          <Box as="span" fontSize="lg" fontWeight="thin">
            Spearbit
          </Box>
          <Box as="span" ml={1}>
            <ArrowUpRight size={12} />
          </Box>
        </Link>{' '}
        and{' '}
        <Link
          alignItems="center"
          display="inline-flex"
          href="https://github.com/trailofbits/publications/blob/master/reviews/2025-01-beethovenx-sonicstaking-securityreview.pdf"
          target="_blank"
        >
          <Box as="span" fontSize="lg" fontWeight="thin">
            Trail of Bits
          </Box>
          <Box as="span" ml={1}>
            <ArrowUpRight size={12} />
          </Box>
        </Link>
      </Text>
    ),
  },
  {
    question: 'What is the contract address for stS?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        The contract address for stS is{' '}
        <Link
          alignItems="center"
          display="inline-flex"
          href="https://sonicscan.org/token/0xe5da20f15420ad15de0fa650600afc998bbe3955"
          target="_blank"
        >
          <Box as="span" fontSize="lg" fontWeight="thin">
            0xE5DA20F15420aD15DE0fa650600aFc998bbE3955
          </Box>
          <Box as="span" ml={1}>
            <ArrowUpRight size={12} />
          </Box>
        </Link>
      </Text>
    ),
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
      <Accordion allowToggle bg="transparent" variant="button">
        {FAQ_ITEMS.map(item => (
          <AccordionItem key={item.question} mb="sm">
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
