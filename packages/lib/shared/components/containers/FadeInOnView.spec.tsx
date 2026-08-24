import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FadeInOnView from './FadeInOnView'

const useInViewMock = vi.fn(() => false)

vi.mock('motion/react', () => ({
  useInView: () => useInViewMock(),
}))

describe('FadeInOnView', () => {
  const originalHash = window.location.hash

  beforeEach(() => {
    useInViewMock.mockReturnValue(false)
    window.location.hash = ''
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    window.location.hash = originalHash
    vi.clearAllMocks()
  })

  it('stays hidden when out of view and hash does not match a child', () => {
    const { container } = render(
      <FadeInOnView>
        <div id="oracles">Oracle risk</div>
      </FadeInOnView>
    )

    expect(container.firstChild).toHaveClass('hidden')
    expect(container.firstChild).not.toHaveClass('visible')
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('becomes visible when useInView reports the section is in view', () => {
    useInViewMock.mockReturnValue(true)

    const { container } = render(
      <FadeInOnView>
        <div id="oracles">Oracle risk</div>
      </FadeInOnView>
    )

    expect(container.firstChild).toHaveClass('visible')
    expect(container.firstChild).toHaveClass('fade-in-scale')
  })

  it('omits fade-in-scale when scaleUp is false', () => {
    useInViewMock.mockReturnValue(true)

    const { container } = render(
      <FadeInOnView scaleUp={false}>
        <div id="oracles">Oracle risk</div>
      </FadeInOnView>
    )

    expect(container.firstChild).toHaveClass('fade-in-opacity')
    expect(container.firstChild).not.toHaveClass('fade-in-scale')
  })

  it('forces visibility and scrolls when the URL hash targets a child', async () => {
    window.location.hash = '#oracles'

    const { container } = render(
      <FadeInOnView>
        <div id="oracles">Oracle risk</div>
      </FadeInOnView>
    )

    await act(async () => {
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve())
      })
    })

    expect(container.firstChild).toHaveClass('visible')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('forces visibility on hashchange when the new hash targets a child', async () => {
    const { container } = render(
      <FadeInOnView>
        <div id="oracles">Oracle risk</div>
      </FadeInOnView>
    )

    expect(container.firstChild).toHaveClass('hidden')

    await act(async () => {
      window.location.hash = '#oracles'
      window.dispatchEvent(new HashChangeEvent('hashchange'))

      await new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve())
      })
    })

    expect(container.firstChild).toHaveClass('visible')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('does not force visibility when hash targets an element outside the section', async () => {
    window.location.hash = '#other-section'

    const { container } = render(
      <FadeInOnView>
        <div id="oracles">Oracle risk</div>
      </FadeInOnView>
    )

    await act(async () => {
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve())
      })
    })

    expect(container.firstChild).toHaveClass('hidden')
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })
})
