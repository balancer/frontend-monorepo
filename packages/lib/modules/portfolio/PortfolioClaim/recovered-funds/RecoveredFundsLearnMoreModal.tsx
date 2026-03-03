import { SuccessOverlay } from '@repo/lib/shared/components/modals/SuccessOverlay'
import {
  Link,
  Box,
  VStack,
  Text,
  List,
  UseDisclosureProps,
  Button,
  Dialog,
  Portal } from '@chakra-ui/react';
import { Picture } from '@repo/lib/shared/components/other/Picture'

export function RecoveredFundsLearnMoreModal({
  isOpen = false,
  onClose = () => {} }: UseDisclosureProps) {
  return (
    <Dialog.Root placement='center' open={isOpen} size='lg' onOpenChange={e => {
      if (!e.open) {
        onClose();
      }
    }}>
      <Portal>

        <SuccessOverlay />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Claim recovery funds</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body pb="lg">
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

                <List.Root color="font.primary" listStylePosition="outside" listStyleType="disc" pl="md">
                  <List.Item mb="xs">
                    <Text>
                      There was a security incident affecting some v2 composable stable pools in
                      November 2025. Through various efforts, some of those funds were recovered.
                    </Text>
                  </List.Item>
                  <List.Item mb="xs">
                    <Text>
                      If you're seeing this message, you have one or more positions affected by the
                      incident and can claim your share of the recovered funds.
                    </Text>
                  </List.Item>
                  <List.Item mb="xs">
                    <Text>
                      Your share has been calculated by following{' '}
                      <Link
                        href="https://forum.balancer.fi/t/bip-892-distribution-of-rescued-funds-from-balancer-v2-november-3rd-2025-attacks/6883"
                        target='_blank'
                        rel='noopener noreferrer'>
                        BIP-892
                      </Link>{' '}
                      . That means that each pool's funds go only to LPs of that specific pool and
                      network, pro-rata by BPT holdings at the snapshot block and you receive the same
                      tokens rescued
                    </Text>
                  </List.Item>
                  <List.Item mb="xs">
                    <Text>You will need to claim using this wallet.</Text>
                  </List.Item>
                  <List.Item mb="xs">
                    <Text>
                      NO KYC is required, but you will need to make an onchain signature to acknowledge
                      and agree to the Claim Settlement Terms.
                    </Text>
                  </List.Item>
                </List.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer gap={3}>
              <Button flex="1" isExternal variant="secondary" asChild><Link href="https://x.com/Balancer/status/2021554863314977087">Read post
                              </Link></Button>
              <Button flex="1" onClick={onClose} variant="tertiary">
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>

      </Portal>
    </Dialog.Root>
  );
}
