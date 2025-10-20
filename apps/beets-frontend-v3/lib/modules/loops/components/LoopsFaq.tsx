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
  UnorderedList,
  ListItem,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

const FAQ_ITEMS = [
  {
    question: 'What is loopS?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        loopS is a leveraged staking vault that compounds your stS yield. It borrows $S against your
        stS and restakes it through Aave to increase rewards safely and automatically.
      </Text>
    ),
  },
  {
    question: 'What can I deposit into loopS?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        You need to deposit $S. When you deposit $S, it’s automatically staked into stS before
        entering the vault. All loopS positions use stS as collateral behind the scenes.
      </Text>
    ),
  },
  {
    question: 'What happens when I deposit?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Your deposit becomes stS collateral. loopS borrows $S from Aave, restakes it, and repeats
        the process to boost your yield.
      </Text>
    ),
  },
  {
    question: 'What do I receive when depositing?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        You receive{' '}
        <Text as="span" fontWeight="bold">
          $loopS tokens
        </Text>
        , a liquid representation of your position in the vault. These tokens accrue value as yield
        builds up and can be held, transferred, or integrated across DeFi as liquidity grows.
      </Text>
    ),
  },
  {
    question: 'How does loopS protect against liquidation?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        loopS continuously monitors your health factor and adjusts positions automatically when
        needed to minimize risk from price or rate changes on Aave.
      </Text>
    ),
  },
  {
    question: 'Can I withdraw anytime?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Yes. You can withdraw anytime. loopS unwinds your position, repays the borrowed $S, and
        returns wS.
      </Text>
    ),
  },
  {
    question: 'Are there any fees?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        A small protocol fee (number) applies to the yield earned. Standard network gas fees also
        apply for deposits and withdrawals.
      </Text>
    ),
  },
  {
    question: 'Why do I get slightly less $S on withdrawal?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        When you withdraw, your position is unwound and converted from stS back to $S through market
        routes on Fly. Because this involves on-chain swaps, the final amount may be slightly lower
        than the displayed rate due to price impact and slippage. This is normal and depends on
        current liquidity conditions.
      </Text>
    ),
  },
  {
    question: 'Why is the amount I receive on withdrawal slightly less than the loopS rate?',
    answer: (
      <>
        <Text color="font.primary" fontSize="lg" fontWeight="thin">
          loopS uses leveraged staking to amplify yield. When you withdraw, part of your position is
          unwound to repay the leveraged portion of your stake. This process can make the amount you
          receive slightly lower than the displayed rate. The difference depends on:
        </Text>
        <br />
        <UnorderedList>
          <ListItem>
            <Text color="font.primary" fontSize="lg" fontWeight="thin">
              Leverage — higher leverage means more assets need to be sold to close your position.
            </Text>
          </ListItem>
          <ListItem>
            <Text color="font.primary" fontSize="lg" fontWeight="thin">
              Market conditions — minor slippage and fees can also impact the final value.
            </Text>
          </ListItem>
        </UnorderedList>
        <br />
        <Text color="font.primary" fontSize="lg" fontWeight="thin">
          This ensures the vault remains fully collateralized and solvent after every withdrawal.
        </Text>
      </>
    ),
  },
  {
    question: 'What is Total Collateral?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Total collateral shows the total amount of stS that is supplied to the vault, including any
        restaked amounts created through looping.
      </Text>
    ),
  },
  {
    question: 'What is Total Debt?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Total debt is the amount of $S borrowed from Aave to create the leveraged positions. It’s
        managed automatically to stay within safe limits.
      </Text>
    ),
  },
  {
    question: 'What does the loopS rate mean?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        The loopS rate shows how much $S each loopS token is worth. As rewards build up, this rate
        gradually increases over time.
      </Text>
    ),
  },
  {
    question: 'What is Health Factor?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Health factor measures how safe the positions are. A higher number means lower liquidation
        risk. If it falls too low, part of the collateral may be sold to repay debt.
      </Text>
    ),
  },
  {
    question: 'What does Current Leverage represent?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        It shows how many times the stS has been looped. For example, 3.25x means you’re earning
        yield on over three times your initial deposit.
      </Text>
    ),
  },
  {
    question: 'Do I earn Sonic Points with loopS?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Yes. loopS positions earn Sonic Points with a multiplier based on the leverage and deposit
        size.
      </Text>
    ),
  },
  {
    question: 'What is the Sonic Points Multiplier?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        It shows how many times your position amplifies your Sonic Points. Higher leverage results
        in a higher multiplier.
      </Text>
    ),
  },
  {
    question: 'What is Actual Supply?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Actual supply refers to the total number of loopS tokens issued, representing all users’
        positions in the vault.
      </Text>
    ),
  },

  {
    question: 'Which wallets can I use?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        loopS works with all major Sonic-compatible wallets such as MetaMask and Rabby.
      </Text>
    ),
  },
  {
    question: 'Is loopS audited?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        Yes. loopS has been fully audited by{' '}
        <Text as="span" fontWeight="bold">
          Spearbit
        </Text>
        , one of the leading smart contract security firms in DeFi.
      </Text>
    ),
  },
  {
    question: 'What is the loopS contract address?',
    answer: (
      <Text color="font.primary" fontSize="lg" fontWeight="thin">
        The official loopS contract can be found here:{' '}
        <Link
          alignItems="center"
          display="inline-flex"
          href="https://sonicscan.org/address/0xc76995054ce51dfbbc954840d699b2f33d2538ee"
          isExternal
        >
          <Box as="span" fontSize="lg" fontWeight="thin">
            0xC76995054Ce51DfBBC954840D699b2F33D2538Ee
          </Box>
          <Box as="span" ml={1}>
            <ArrowUpRight size={12} />
          </Box>
        </Link>
        . Always verify that you are interacting with the correct address before depositing.
      </Text>
    ),
  },
]

export function LoopsFaq() {
  return (
    <Card rounded="xl" w="full">
      <CardHeader as={HStack} justify="space-between" w="full">
        <Heading as="h2" size="lg">
          FAQ
        </Heading>
      </CardHeader>
      <CardBody align="start" as={VStack}>
        <Accordion allowToggle bg="transparent" variant="button" w="full">
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
      </CardBody>
    </Card>
  )
}
