import { TokenApprovalLabelArgs, buildTokenApprovalLabels } from './approval-labels'

test('Token approval labels for add liquidity', () => {
  const args: TokenApprovalLabelArgs = {
    actionType: 'AddLiquidity',
    symbol: 'WETH',
    requiredRawAmount: 100000000n,
  }
  const result = buildTokenApprovalLabels(args)
  expect(result).toMatchInlineSnapshot(`
    {
      "confirmed": "WETH approved!",
      "confirming": "Approving WETH...",
      "description": "Approval of WETH for adding liquidity.",
      "error": "Error approving WETH",
      "init": "Approve WETH to add",
      "title": "Approve WETH",
      "tooltip": "You must approve WETH to add liquidity for this token on Balancer.
    Approvals are required once per token, per wallet.",
    }
  `)
})

test('Token approval title when approving 0 USDT', () => {
  const args: TokenApprovalLabelArgs = {
    actionType: 'AddLiquidity',
    symbol: 'WETH',
    requiredRawAmount: 0n,
  }
  const result = buildTokenApprovalLabels(args)
  expect(result.title).toBe('Approve WETH')
})

test('Token approval labels for unapprove', () => {
  const args: TokenApprovalLabelArgs = {
    actionType: 'Unapprove',
    symbol: 'WETH',
    requiredRawAmount: 100000000n,
  }
  const result = buildTokenApprovalLabels(args)
  expect(result).toMatchInlineSnapshot(`
    {
      "confirmed": "WETH unapproved",
      "confirming": "Unapproving WETH...",
      "description": "Unapprove WETH",
      "error": "Error unapproving WETH",
      "init": "Unapprove WETH",
      "title": "Approve WETH",
      "tooltip": "You must unapprove WETH before a new approval value can be set.",
    }
  `)
})
