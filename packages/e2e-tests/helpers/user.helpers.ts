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
