/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import { Link } from '@chakra-ui/react'
import { PoolIssue } from './PoolIssue.type'
import { ReactNode } from 'react'

const vulnerabilityTitle =
  'A vulnerability has been discovered that affects this pool. Existing liquidity providers should remove liquidity immediately.'

const eulerTitle =
  'Due to an exploit on Euler, this pool has been set to recovery mode by the Emergency multisig'
const emergencyMultisigLink = 'https://docs.balancer.fi/concepts/governance/emergency.html'

const vulnerabilityDisclosure = `This pool is affected by a disclosed vulnerability.`
const vulnerabilityDisclosureLink = 'https://forum.balancer.fi/t/vulnerability-disclosure/3179'

type VunerabilityData = {
  jsxTitle: ReactNode
  learnMoreLink?: string
}

export const VulnerabilityDataMap: Record<PoolIssue, VunerabilityData> = {
  [PoolIssue.PoolProtocolFeeVulnWarning]: {
    jsxTitle: <>{vulnerabilityTitle}</>,
    learnMoreLink: 'https://twitter.com/Balancer/status/1611363559685898247',
  },
  [PoolIssue.PoolOwnerVulnWarningGovernanceMigrate]: {
    jsxTitle: <>{vulnerabilityDisclosure}. You're advised to migrate your liquidity.</>,
    learnMoreLink: vulnerabilityDisclosureLink,
  },
  [PoolIssue.PoolOwnerVulnWarningGovernanceWithdraw]: {
    jsxTitle: (
      <>
        This pool was deprecated due to a{' '}
        <Link
          href="https://forum.balancer.fi/t/vulnerability-disclosure/3179"
          target="blank"
          rel="noreferrer"
          color="font.dark"
          _hover={{ color: 'font.maxContrast' }}
        >
          vulnerability
        </Link>
        . You're advised to withdraw your liquidity asap. Add it to the{' '}
        <Link
          href="https://app.balancer.fi/#/ethereum/pool/0xa13a9247ea42d743238089903570127dda72fe4400000000000000000000035d"
          target="blank"
          rel="noreferrer"
          color="font.dark"
          _hover={{ color: 'font.maxContrast' }}
        >
          upgraded pool{' '}
        </Link>
        to participate in liquidity incentives.
      </>
    ),
  },
  [PoolIssue.PoolOwnerVulnWarningGovernance]: {
    jsxTitle: (
      <>
        {vulnerabilityDisclosure}. Reach out on Discord if you need help creating a new pool with
        same composition.
      </>
    ),
    learnMoreLink: vulnerabilityDisclosureLink,
  },
  [PoolIssue.PoolOwnerVulnWarningEcosystem]: {
    jsxTitle: (
      <>
        {vulnerabilityDisclosure}. Reach out on Discord if you need help creating a new pool with
        the same composition.
      </>
    ),
    learnMoreLink: vulnerabilityDisclosureLink,
  },
  [PoolIssue.PoolOwnerVulnWarningEcosystemMigrate]: {
    jsxTitle: <>{vulnerabilityDisclosure}. You're advised to migrate your liquidity.</>,
    learnMoreLink: vulnerabilityDisclosureLink,
  },
  [PoolIssue.RenBTCWarning]: {
    jsxTitle: (
      <>
        You are strongly advised to withdraw any liquidity from this pool ASAP to avoid losses!
        Ideally you should withdraw in a proportional fashion to reduce price impact. The Ren 1.0
        network is expected to be{' '}
        <Link
          href="https://medium.com/renproject/moving-on-from-alameda-da62a823ce93"
          target="blank"
          rel="noreferrer"
          color="font.dark"
          _hover={{ color: 'font.maxContrast' }}
        >
          sunset
        </Link>{' '}
        in December 2022. This will render this version of the renBTC token as valueless, which will
        trend the overall pool value towards zero. Ren Protocol also strongly advises to{' '}
        <Link
          href="https://twitter.com/renprotocol/status/1595807696296751104"
          target="blank"
          rel="noreferrer"
          color="font.dark"
          _hover={{ color: 'font.maxContrast' }}
        >
          bridge all ren assets
        </Link>{' '}
        back to their native chain ASAP to avoid being left holding a valueless token which can no
        longer be redeemed for the native asset.
      </>
    ),
  },
  [PoolIssue.CspPoolVulnWarning]: {
    jsxTitle: <>{vulnerabilityTitle}</>,
    learnMoreLink: 'https://forum.balancer.fi/t/vulnerability-found-in-some-pools/5102/1',
  },
  [PoolIssue.EulerBoostedWarning]: {
    jsxTitle: (
      <>
        {eulerTitle}. Euler has disabled the transferability of eTokens so withdrawals from this
        pool are not possible until that functionality is restored.
      </>
    ),
    learnMoreLink: emergencyMultisigLink,
  },
  [PoolIssue.EulerRecoveryModeWarning]: {
    jsxTitle: (
      <>
        {eulerTitle}. Proportional withdrawals are enabled in the UI and you are encouraged to
        withdraw as soon as possible.
      </>
    ),
    learnMoreLink: emergencyMultisigLink,
  },
  [PoolIssue.FxPoolVulnWarning]: {
    jsxTitle: (
      <>
        Xave's FXPools are potentially affected by a bug. Xave recommends that LPs temporarily
        remove remove liquidity from this pool.
      </>
    ),
    learnMoreLink: 'https://twitter.com/XaveFinance/status/1725089131330756628',
  },
}
