import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Modal,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Link,
  Box,
  ModalHeader,
  VStack,
  Text,
  List,
  ListItem,
  UseDisclosureProps,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { Picture } from '@repo/lib/shared/components/other/Picture'

export function RecoveredFundsLearnMoreModal({
  isOpen = false,
  onClose = () => {},
}: UseDisclosureProps) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
      <SuccessOverlay />
      <ModalContent>
        <ModalHeader>Claim recovery funds</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb="lg">
          <VStack gap="lg">
            <Box overflow="hidden" rounded="md">
              <Picture
                altText="Recovery header icon"
                defaultImgType="jpg"
                directory="/images/claims/"
                height="240"
                imgAvif
                imgJpg
                imgName="recovery-header"
                width="800"
              />
            </Box>

            <List color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
              <ListItem mb="xs">
                <Text>
                  There was a security incident affecting some v2 composable stable pools in
                  November 2025. Through various efforts, some of those funds were recovered.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  If you're seeing this message, you have one or more positions affected by the
                  incident and can claim your share of the recovered funds.
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  Your share has been calculated by following{' '}
                  <Link
                    href="https://forum.balancer.fi/t/bip-892-distribution-of-rescued-funds-from-balancer-v2-november-3rd-2025-attacks/6883"
                    isExternal
                  >
                    BIP-892
                  </Link>{' '}
                  . That means that each pool's funds go only to LPs of that specific pool and
                  network, pro-rata by BPT holdings at the snapshot block and you receive the same
                  tokens rescued
                </Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>You will need to claim using this wallet.</Text>
              </ListItem>
              <ListItem mb="xs">
                <Text>
                  NO KYC is required, but you will need to make an onchain signature to acknowledge
                  and agree to the Claim Settlement Terms.
                </Text>
              </ListItem>
            </List>
          </VStack>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button flex="1" hidden onClick={onClose} variant="secondary">
            Read post
          </Button>
          <Button flex="1" onClick={onClose} variant="tertiary">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
