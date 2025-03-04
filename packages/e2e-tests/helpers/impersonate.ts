import { forkClient, defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

// For now, we don't use this helper as ImpersonatorAccount already impersonates the account
export async function impersonate(address?: string) {
  const client = forkClient
  await client.impersonateAccount({
    address: (address as `0x${string}`) || defaultAnvilAccount,
  })
}
