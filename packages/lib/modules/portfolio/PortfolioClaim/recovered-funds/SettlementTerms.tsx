import { ListItem, Text, UnorderedList, VStack } from '@chakra-ui/react'

export function SettlementTerms() {
  return (
    <VStack>
      <Text width="100%">{`I ACCEPT BALANCER'S T&C APPLICABLE TO THIS CLAIM, INCL. ALL PROVISIONS
      OF THE ToU AND RELEVANT GOV RESOLUTIONS, INCL. LIMITATION OF LIABILITY, MANDATORY ARBITRATION
      AND RISK DISCLOSURES. I HEREBY CONFIRM & AGREE TO THE FOLLOWING:`}</Text>
      <br />
      <UnorderedList>
        <ListItem>
          My acceptance constitutes full final settlement & release of any past, present, & future
          claims, liabilities, demands, actions, causes of action, damages, or losses of any kind,
          known or unknown, arising out of or related to the Balancer exploit.
        </ListItem>
        <ListItem>
          This waiver incl. claims and any right to participate in any class or collective action
          against the Balancer Foundation & all affiliated entities, as well as their respective
          officers, directors, contributors, service providers, employees, contractors, advisors,
          agents, successors, & assigns.
        </ListItem>
        <ListItem>
          I acknowledge & agree to the Safe Harbor Agreement in all its terms (as approved by
          Balancer governance resolution).
        </ListItem>
        <ListItem>
          I understand that my claim will not be processed unless I accept these terms in full &
          without modification.
        </ListItem>
      </UnorderedList>
    </VStack>
  )
}
