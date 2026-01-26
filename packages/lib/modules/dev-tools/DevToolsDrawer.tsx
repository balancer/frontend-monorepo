import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  TabList,
  TabPanels,
  Tabs,
  Tab,
  useDisclosure,
  DrawerFooter,
  TabPanel,
  Divider,
  VStack,
} from '@chakra-ui/react'
import { Tool } from 'react-feather'
import { ImpersonateAccount } from '../web3/impersonation/ImpersonateAccount'
import TimeMocker from '../web3/impersonation/TimeMocker'
import { useCurrentDate, useFakeTime } from '@repo/lib/shared/hooks/date.hooks'
import { useImpersonateAccount } from '../web3/impersonation/useImpersonateAccount'
import { oneSecondInMs } from '@repo/lib/shared/utils/time'

export function DevToolsDrawerButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()

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
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="lg">
      <DrawerOverlay />

      <DrawerContent data-testid="dev-tools-drawer">
        <DrawerCloseButton aria-label="Dev tools close button" />
        <DrawerHeader>Dev tools</DrawerHeader>

        <DrawerBody>
          <Tabs>
            <TabList>
              <Tab>Impersonation</Tab>
              <Tab>Time mgmt</Tab>
              <Tab>Pool mgmt</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <ImpersonateAccount />
              </TabPanel>

              <TabPanel>
                <TimeMocker setIsFakeTime={setIsFakeTime} />
              </TabPanel>

              <TabPanel>Pool management content</TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>

        <DrawerFooter>
          <VStack w="full">
            {isFakeTime && <div>Fake date: {currentDate.toLocaleDateString()}</div>}

            <Divider />

            <Button onClick={() => reset()}>Reset fork</Button>
          </VStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
