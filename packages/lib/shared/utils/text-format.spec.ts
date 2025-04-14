import { formatTextListAsItems } from './text-format'

describe('Format a list of string as itemized list of texts', () => {
  it('should return an itemized list of one element', () => {
    const elements = ['Some text']

    const itemizedText = formatTextListAsItems(elements)

    expect(itemizedText).toBe('- Some text')
  })

  it('should return an itemized list of multiple elements', () => {
    const elements = ['Some text', 'Other text']

    const itemizedText = formatTextListAsItems(elements)

    expect(itemizedText).toBe('- Some text\n- Other text')
  })
})
