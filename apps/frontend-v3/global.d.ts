import { HumanAmount } from '@balancer/sdk'
import React from 'react'

/*
Global type overrides for TypeScript
*/
declare module 'viem' {
  //Override viem's formatUnits function to return HumanAmount (AKA `${number}`) to improve type safety
  export function formatUnits(value: bigint, decimals: number): HumanAmount
}

declare module 'react' {
  interface HTMLAttributes<T> extends React.HTMLAttributes<T> {
    popover?: 'auto' | 'manual' | boolean
  }

  interface ButtonHTMLAttributes<T> extends React.HTMLAttributes<T> {
    popovertarget?: string
    popovertargetaction?: string
  }
}
