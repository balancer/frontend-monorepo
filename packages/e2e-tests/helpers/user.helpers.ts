import { Page } from '@playwright/test'

export async function clickButton(page: Page, text: string) {
  const regex = new RegExp('^' + text + '$', 'i')
  return page.getByRole('button', { name: regex }).click()
}

export async function forceClickButton(page: Page, text: string) {
  const regex = new RegExp('^' + text + '$', 'i')
  return page.getByRole('button', { name: regex }).click({ force: true })
}

export async function isButtonVisible(page: Page, text: string) {
  try {
    await button(page, text).waitFor({ timeout: 10000 })
  } catch (e) {}
  return button(page, text).isVisible()
}

export function button(page: Page, text: string) {
  const regex = new RegExp('^' + text + '$', 'i')
  return page.getByRole('button', { name: regex })
}

export async function clickLink(page: Page, text: string) {
  const regex = new RegExp('^' + text + '$', 'i')
  return page.getByRole('link', { name: regex }).click()
}

export async function clickRadio(page: Page, groupLabel: string, radioLabel: string, exact = true) {
  const pattern = exact ? `^${radioLabel}$` : `^${radioLabel}`
  const regex = new RegExp(pattern, 'i')
  return page.getByRole('radiogroup', { name: groupLabel }).getByText(regex).click()
}

export async function setSliderPercent(page: Page, percent: number) {
  const slider = page.locator('.chakra-slider')
  const box = await slider.boundingBox()
  await slider.click({
    position: { x: (box.width * percent) / 100, y: box.height / 2 },
  })
}

export async function checkbox(page: Page, text: string) {
  return page.locator('label', { hasText: text }).locator('.chakra-checkbox__control')
}

// reliable method for selecting pill buttons at top of token select modal
export async function selectPopularToken(page: Page, tokenSymbol: string) {
  await button(page, 'Select token').first().click()
  const modalHeader = page.getByText('Select a token')
  await modalHeader.waitFor({ state: 'visible' })
  const modal = page.getByRole('dialog').filter({ has: modalHeader })
  await modal
    .getByRole('group')
    .filter({ has: page.getByText(tokenSymbol, { exact: true }) })
    .first()
    .click()
}

export async function doAddLiquidityTxSteps(page: Page) {
  const addLiquidityButton = button(page, 'Add liquidity')
  const approveButton = page.getByRole('button', { name: /(Approve|Sign)/i })

  while (!(await addLiquidityButton.isVisible())) {
    await addLiquidityButton.or(approveButton).waitFor()
    try {
      if (await approveButton.isVisible()) await approveButton.click({ timeout: 5000 })
    } catch {
      // Button was detached between visibility check and click
    }
  }

  await addLiquidityButton.click()
}
