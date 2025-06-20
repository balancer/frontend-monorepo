'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/spot', label: 'Spot' },
  { href: 'https://lending.aggtrade.xyz/', label: 'Lend/Borrow' },
  { href: 'https://perp.aggtrade.xyz/', label: 'Perps' },
  { href: 'https://yield.aggtrade.xyz/', label: 'Yield Farming' },
  { href: 'https://aggtrade.xyz/profile', label: 'Account' },
]

export default function AggtraderNavbar() {
  const pathname = usePathname()

  return (
    <nav className="navbar">
      <h2 className="navbar__logo">AggTrade</h2>
      <ul className="navbar__list">
        {navItems.map(({ href, label }) => {
          const isInternal = href.startsWith('/')
          const isActive = isInternal && (pathname === href || pathname.startsWith(href))

          return (
            <li key={href} className="navbar__item">
              {isInternal ? (
                <Link
                  href={href}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              ) : (
                <a href={href} className="nav-link" target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
