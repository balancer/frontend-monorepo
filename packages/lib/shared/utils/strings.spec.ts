import { hasWhitespace, isValidTelegramHandle, isValidTwitterHandle } from './strings'

describe('Twitter handle validation', () => {
  it('should allow no handle', () => {
    expect(isValidTwitterHandle('')).toBe(true)
  })

  it('should allow small handles', () => {
    expect(isValidTwitterHandle('@a')).toBe(true)
  })

  it('should allow big handles', () => {
    expect(isValidTwitterHandle('@aaaaaaaaaaaaaaa')).toBe(true)
  })

  it('should not allow too big handles', () => {
    expect(isValidTwitterHandle('@aaaaaaaaaaaaaaab')).not.toBe(true)
  })

  it('should not allow empty handles', () => {
    expect(isValidTwitterHandle('@')).not.toBe(true)
  })

  it('should not allow invalid chars', () => {
    expect(isValidTwitterHandle('@a?')).not.toBe(true)
  })
})

describe('Telegram handle validation', () => {
  it('should allow no handle', () => {
    expect(isValidTelegramHandle('')).toBe(true)
  })

  it('should allow small handles', () => {
    expect(isValidTelegramHandle('@aaaaa')).toBe(true)
  })

  it('should allow big handles', () => {
    expect(isValidTelegramHandle('@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(true)
  })

  it('should not allow too big handles', () => {
    expect(isValidTelegramHandle('@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab')).not.toBe(true)
  })

  it('should not allow empty handles', () => {
    expect(isValidTelegramHandle('@')).not.toBe(true)
  })

  it('should not allow too small handles', () => {
    expect(isValidTelegramHandle('@aa')).not.toBe(true)
  })

  it('should not allow invalid chars', () => {
    expect(isValidTelegramHandle('@a?')).not.toBe(true)
  })
})

describe('Whitespace check', () => {
  it('should return true if string has whitespace', () => {
    expect(hasWhitespace('a b')).toBe(true)
    expect(hasWhitespace('a\tb')).toBe(true)
  })

  it('should return false for strings without whitespace', () => {
    expect(hasWhitespace('abc')).toBe(false)
  })
})
