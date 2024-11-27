'use client'

import { useEffect } from 'react'
import Prism from 'prismjs'
import './vscode.theme.css'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-solidity'

export default function PrismLoader() {
  useEffect(() => {
    Prism.highlightAll()
  }, [])
  return <div className="hidden" />
}
