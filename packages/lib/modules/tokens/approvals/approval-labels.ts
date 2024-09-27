import { BuildTransactionLabels } from '../../web3/contracts/transactionLabels'

export type ApprovalAction =
  | 'AddLiquidity'
  | 'Locking'
  | 'Staking'
  | 'Swapping'
  | 'Unapprove'
  | 'Unwrapping'

export type TokenApprovalLabelArgs = {
  actionType: ApprovalAction
  symbol: string
  requiredRawAmount: bigint
}

export const buildTokenApprovalLabels: BuildTransactionLabels = ({
  actionType,
  symbol,
}: TokenApprovalLabelArgs) => {
  return {
    init: initApprovalLabelFor(actionType, symbol),
    title: `Approve ${symbol}`,
    description: descriptionFor(actionType, symbol),
    confirming: actionType === 'Unapprove' ? `Unapproving ${symbol}...` : `Approving ${symbol}...`,
    confirmed: `${symbol} ${actionType === 'Unapprove' ? 'unapproved' : 'approved!'}`,
    tooltip: tooltipApprovalLabelFor(actionType, symbol),
    error: `Error ${actionType === 'Unapprove' ? 'unapproving' : 'approving'} ${symbol}`,
  }
}

function initApprovalLabelFor(actionType: ApprovalAction, symbol: string) {
  switch (actionType) {
    case 'Locking':
      return `Approve LP token to lock`
    case 'Staking':
      return `Approve LP token to stake`
    case 'Swapping':
      return `Approve ${symbol} to swap`
    case 'Unapprove':
      return `Unapprove ${symbol}`
    case 'Unwrapping':
      return `Approve ${symbol} to unwrap`
    case 'AddLiquidity':
      return `Approve ${symbol} to add`
    default:
      return `Approve ${symbol}`
  }
}

function descriptionFor(actionType: ApprovalAction, symbol: string) {
  switch (actionType) {
    case 'Locking':
      return `Approval of LP token to lock`
    case 'Staking':
      return `Approval of LP token to stake`
    case 'Swapping':
      return `Approval of ${symbol} to swap`
    case 'Unapprove':
      return `Unapprove ${symbol}`
    case 'Unwrapping':
      return `Approval of ${symbol} to unwrap`
    case 'AddLiquidity':
      return `Approval of ${symbol} for adding liquidity.`
    default:
      return `Approve ${symbol}`
  }
}

function tooltipApprovalLabelFor(actionType: ApprovalAction, symbol: string) {
  switch (actionType) {
    case 'Locking':
      return `You must approve ${symbol} to lock this token. Approvals are required once per token, per wallet.`
    case 'Staking':
      return `You must approve ${symbol} to stake this token. Approvals are required once per token, per wallet.`
    case 'Swapping':
      return `You must approve ${symbol} to swap this token. Approvals are required once per token, per wallet.`
    case 'Unapprove':
      return `You must unapprove ${symbol} before a new approval value can be set.`
    case 'Unwrapping':
      return `You must approve ${symbol} to unwrap this token. Approvals are required once per token, per wallet.`
    case 'AddLiquidity':
      return `You must approve ${symbol} to add liquidity for this token on Balancer.
Approvals are required once per token, per wallet.`
    default:
      return `You must approve ${symbol} to use this token. Approvals are required once per token, per wallet.`
  }
}
