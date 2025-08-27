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
