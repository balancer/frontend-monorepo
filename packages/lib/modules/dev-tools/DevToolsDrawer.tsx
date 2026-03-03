import {
  Button,
  Drawer,
  TabList,
  TabPanels,
  Tabs,
  Tab,
  useDisclosure,
  TabPanel,
  VStack,
  Separator,
  Portal } from '@chakra-ui/react';
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

      <DevToolsDrawer isOpen={isOpen} onClose={onClose} />
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
    <Drawer.Root open={isOpen} placement='end' size='lg' onOpenChange={e => {
      if (!e.open) {
        onClose();
      }
    }}>
      <Portal>

        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content data-testid="dev-tools-drawer">
            <Drawer.CloseTrigger aria-label="Dev tools close button" />
            <Drawer.Header>Dev tools</Drawer.Header>
            <Drawer.Body>
              <Tabs.Root>
                <Tabs.List>
                  <Tab>Impersonation</Tab>
                  <Tab>Time mgmt</Tab>
                  <Tab>Pool mgmt</Tab>
                </Tabs.List>

                <TabPanels>
                  <TabPanel>
                    <ImpersonateAccount />
                  </TabPanel>

                  <TabPanel>
                    <TimeMocker setIsFakeTime={setIsFakeTime} />
                  </TabPanel>

                  <TabPanel>Pool management content</TabPanel>
                </TabPanels>
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
  );
}
