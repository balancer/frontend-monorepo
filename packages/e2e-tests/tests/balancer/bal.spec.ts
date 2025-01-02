import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://balancer.fi/pools');
  await page.getByRole('link', { name: 'View pools' }).click();
  await page
    .getByRole('link', { name: 'Gnosis wstETH wstETH 50% GNO' })
    .click();
  await page.getByRole('button', { name: 'Add liquidity' }).click();
  await page.getByText('ProportionalWhen you enter an').click();
  await page.getByPlaceholder('0.00').first().fill('1');
  await page.getByRole('button', { name: 'Connect wallet' }).nth(2);
});
