import { Button, Drawer, Tabs, useDisclosure, VStack, Separator, Portal } from '@chakra-ui/react'
import { Tool } from 'react-feather'
import { ImpersonateAccount } from '../web3/impersonation/ImpersonateAccount'
import TimeMocker from '../web3/impersonation/TimeMocker'
import { useCurrentDate, useFakeTime } from '@repo/lib/shared/hooks/date.hooks'
import { useImpersonateAccount } from '../web3/impersonation/useImpersonateAccount'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'

export function DevToolsDrawerButton() {
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button aria-label="Dev tools button" onClick={onOpen} p="0" variant="tertiary">
        <Tool size={18} />
      </Button>

      <DevToolsDrawer isOpen={open} onClose={onClose} />
    </>
  )
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

function DevToolsDrawer({ isOpen, onClose }: Props) {
  const { isFakeTime, setIsFakeTime } = useFakeTime()
  const currentDate = useCurrentDate(oneSecondInMs)
  const { reset } = useImpersonateAccount()

  return (
    <Drawer.Root
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          onClose()
        }
      }}
      open={isOpen}
      placement="end"
      size="lg"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content data-testid="dev-tools-drawer">
            <Drawer.CloseTrigger aria-label="Dev tools close button" />
            <Drawer.Header>Dev tools</Drawer.Header>
            <Drawer.Body>
              <Tabs.Root defaultValue="impersonation">
                <Tabs.List>
                  <Tabs.Trigger value="impersonation">Impersonation</Tabs.Trigger>
                  <Tabs.Trigger value="time">Time mgmt</Tabs.Trigger>
                  <Tabs.Trigger value="pool">Pool mgmt</Tabs.Trigger>
                </Tabs.List>

                <Tabs.ContentGroup>
                  <Tabs.Content value="impersonation">
                    <ImpersonateAccount />
                  </Tabs.Content>

                  <Tabs.Content value="time">
                    <TimeMocker setIsFakeTime={setIsFakeTime} />
                  </Tabs.Content>

                  <Tabs.Content value="pool">Pool management content</Tabs.Content>
                </Tabs.ContentGroup>
              </Tabs.Root>
            </Drawer.Body>
            <Drawer.Footer>
              <VStack w="full">
                {isFakeTime && <div>Fake date: {currentDate.toLocaleDateString()}</div>}

                <Separator />

                <Button onClick={() => reset()}>Reset fork</Button>
              </VStack>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
