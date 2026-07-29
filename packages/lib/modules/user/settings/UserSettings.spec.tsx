import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { SlippageInput } from './UserSettings'

function StatefulSlippageInput() {
  const [slippage, setSlippage] = useState('10')

  return <SlippageInput setSlippage={setSlippage} slippage={slippage} />
}

function DismissibleSlippageInput({ isVisible }: { isVisible: boolean }) {
  const [slippage, setSlippage] = useState('0.5')

  return (
    <>
      <output data-testid="slippage">{slippage}</output>
      {isVisible && <SlippageInput setSlippage={setSlippage} slippage={slippage} />}
    </>
  )
}

describe('SlippageInput', () => {
  test('keeps a cleared value local until a valid replacement is entered', () => {
    const setSlippage = vi.fn()

    render(<SlippageInput setSlippage={setSlippage} slippage="0.5" />)

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '' } })

    expect(input).toHaveValue(null)
    expect(setSlippage).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: '1' } })

    expect(setSlippage).toHaveBeenCalledWith('1')
  })

  test('keeps focus while deleting a multi-digit value', () => {
    render(<StatefulSlippageInput />)

    const input = screen.getByRole('spinbutton')
    input.focus()

    fireEvent.change(input, { target: { value: '1' } })

    const updatedInput = screen.getByRole('spinbutton')
    expect(updatedInput).toHaveFocus()

    fireEvent.change(updatedInput, { target: { value: '' } })

    expect(screen.getByRole('spinbutton')).toHaveFocus()
  })

  test('restores the previous slippage when an empty draft is dismissed', () => {
    const { rerender } = render(<DismissibleSlippageInput isVisible />)
    const input = screen.getByRole('spinbutton')

    input.focus()
    fireEvent.change(input, { target: { value: '0' } })
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } })

    rerender(<DismissibleSlippageInput isVisible={false} />)

    expect(screen.getByTestId('slippage')).toHaveTextContent('0.5')
  })
})
