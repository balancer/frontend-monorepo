import { mock } from 'vitest-mock-extended'
import { StepProps, getStepSettings } from './getStepSettings'
import { ManagedResult, TransactionStep } from '../lib'

const transaction = mock<ManagedResult>()
const step = mock<TransactionStep>()
step.labels.title = 'Add Liquidity'

describe('generates step props', () => {
  test('when the step is active and the transaction execution is loading', () => {
    transaction.simulation.isLoading = false
    transaction.execution.isPending = true
    transaction.result.isSuccess = false

    const props: StepProps = {
      currentIndex: 0,
      index: 0,
      step,
      colorMode: 'light',
      isLastStep: true,
    }
    const state = getStepSettings(props, transaction)

    expect(state).toMatchInlineSnapshot(`
      {
        "color": "orange.300",
        "isActive": true,
        "isActiveLoading": true,
        "status": "active",
        "stepNumber": 1,
        "title": "Add Liquidity",
      }
    `)
  })

  test('when the last step transaction is complete (result is success)', () => {
    transaction.result.isSuccess = true

    const props: StepProps = {
      currentIndex: 0,
      index: 0,
      step,
      colorMode: 'light',
      isLastStep: true,
    }
    const state = getStepSettings(props, transaction)

    expect(state).toMatchInlineSnapshot(`
      {
        "color": "grayText",
        "isActive": true,
        "isActiveLoading": false,
        "status": "complete",
        "stepNumber": 1,
        "title": "Add Liquidity",
      }
    `)
  })

  test('when the step is incomplete', () => {
    const props: StepProps = {
      currentIndex: 0,
      index: 1,
      step,
      colorMode: 'light',
      isLastStep: true,
    }
    const state = getStepSettings(props, transaction)

    expect(state).toMatchInlineSnapshot(`
      {
        "color": "gray",
        "isActive": false,
        "isActiveLoading": false,
        "status": "incomplete",
        "stepNumber": 2,
        "title": "Add Liquidity",
      }
    `)
  })
})
