import {
  type MouseEvent,
  SVGProps,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Address } from 'viem'
import { GqlChain } from '../../services/api/generated/graphql'
import { getTokenColor } from '../../../styles/token-colors'

type NetworkPreviewSVGProps = SVGProps<SVGSVGElement> & {
  chain: GqlChain
  tokenAddresses: Address[]
  tokenSymbols?: string[]
  tokenWeights?: number[]
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  }
}

function fullDonutPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngleRad: number
) {
  const halfTurn = Math.PI

  const outerStart = polarToCartesian(cx, cy, outerR, startAngleRad)
  const outerMid = polarToCartesian(cx, cy, outerR, startAngleRad + halfTurn)

  const innerStart = polarToCartesian(cx, cy, innerR, startAngleRad)
  const innerMid = polarToCartesian(cx, cy, innerR, startAngleRad + halfTurn)

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 1 1 ${outerMid.x} ${outerMid.y}`,
    `A ${outerR} ${outerR} 0 1 1 ${outerStart.x} ${outerStart.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 1 0 ${innerMid.x} ${innerMid.y}`,
    `A ${innerR} ${innerR} 0 1 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

function normalizeWeights(tokenCount: number, tokenWeights?: number[]) {
  if (tokenCount === 0) return []

  const base = tokenWeights?.slice(0, tokenCount) ?? []
  const weights = Array.from({ length: tokenCount }, (_, i) => {
    const raw = base[i]
    return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : 0
  })

  const total = weights.reduce((acc, w) => acc + w, 0)
  if (total <= 0) return Array.from({ length: tokenCount }, () => 1 / tokenCount)
  return weights.map(w => w / total)
}

function computeArcs(
  normalizedAddresses: Address[],
  fractions: number[],
  circumference: number,
  dividerGapLen: number,
  chain: GqlChain
) {
  if (normalizedAddresses.length === 0) return []

  const gap = normalizedAddresses.length > 1 ? dividerGapLen : 0
  let cumulativeLen = 0
  return normalizedAddresses.map((address, i) => {
    const fraction = fractions[i] ?? 0
    const rawLen = circumference * fraction

    const isLast = i === normalizedAddresses.length - 1
    const fullLen = isLast ? Math.max(0, circumference - cumulativeLen) : rawLen
    const dashLen = Math.max(0, fullLen - gap)
    const dashOffset = -cumulativeLen
    cumulativeLen += fullLen

    const { from, to } = getTokenColor(chain, address, i)
    const gradientId = `token-grad-${chain}-${address}`

    return {
      dashLen,
      dashOffset,
      from,
      gradientId,
      i,
      to,
      address,
    }
  })
}

export function NetworkPreviewSVG({
  chain,
  tokenAddresses,
  tokenSymbols,
  tokenWeights,
  ...props
}: NetworkPreviewSVGProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoverClientPoint, setHoverClientPoint] = useState<{ x: number; y: number } | null>(null)

  const globalDelayMs = 200
  const tweenMs = 400
  const dividerGapLen = 0.75
  const pulseTotalMs = 1500
  const pulseIterations = 2
  const pulseCycleMs = pulseTotalMs / pulseIterations

  const normalizedAddresses = useMemo(
    () => tokenAddresses.map(addr => addr.toLowerCase() as Address),
    [tokenAddresses]
  )

  const prevAddressesRef = useRef<Address[]>([])
  const prevCountRef = useRef(0)
  const prevArcMapRef = useRef<
    Map<Address, { dashLen: number; dashOffset: number; gradientId: string }>
  >(new Map())

  const fractions = normalizeWeights(normalizedAddresses.length, tokenWeights)

  const animationTrigger = useMemo(() => {
    const addrKey = normalizedAddresses.join('|')
    const weightsKey = fractions.map(w => w.toFixed(6)).join('|')
    return `${chain}:${addrKey}:${weightsKey}`
  }, [chain, normalizedAddresses, fractions])

  const cx = 76
  const cy = 76
  const outerR = 75
  const innerR = 45
  const startAngleBase = -Math.PI / 2

  const midR = (outerR + innerR) / 2
  const strokeW = outerR - innerR
  const circumference = 2 * Math.PI * midR

  const arcs = computeArcs(normalizedAddresses, fractions, circumference, dividerGapLen, chain)

  useEffect(() => {
    const next = new Map<Address, { dashLen: number; dashOffset: number; gradientId: string }>()
    for (const arc of arcs) {
      next.set(arc.address, {
        dashLen: arc.dashLen,
        dashOffset: arc.dashOffset,
        gradientId: arc.gradientId,
      })
    }
    prevArcMapRef.current = next
  }, [arcs])

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const prevAddresses = prevAddressesRef.current
    const prevCount = prevCountRef.current
    const currentAddresses = normalizedAddresses

    const added = currentAddresses.filter(addr => !prevAddresses.includes(addr))
    const removed = prevAddresses.filter(addr => !currentAddresses.includes(addr))

    // No address changes: still update refs so future diffs are correct.
    // (This also avoids leaving any previously-hidden arcs invisible if state settles quickly on mount.)
    if (added.length === 0 && removed.length === 0) {
      prevAddressesRef.current = currentAddresses
      prevCountRef.current = currentAddresses.length
      return
    }

    // If the component mounts with tokens already selected (e.g. page refresh),
    // don't treat all tokens as "added". Render them immediately.
    if (
      prevCount === 0 &&
      prevAddresses.length === 0 &&
      removed.length === 0 &&
      added.length === currentAddresses.length
    ) {
      prevAddressesRef.current = currentAddresses
      prevCountRef.current = currentAddresses.length

      const next = new Map<Address, { dashLen: number; dashOffset: number; gradientId: string }>()
      for (const arc of arcs) {
        next.set(arc.address, {
          dashLen: arc.dashLen,
          dashOffset: arc.dashOffset,
          gradientId: arc.gradientId,
        })
      }
      prevArcMapRef.current = next
      return
    }

    const timeouts: number[] = []
    const hiddenAdded: Address[] = []

    const arcsGroup = svg.querySelector('g[data-layer="arcs"]') as SVGGElement | null
    if (!arcsGroup) return

    const getCircle = (addr: Address) =>
      svg.querySelector(`circle[data-addr="${addr}"]`) as SVGCircleElement | null

    const prevArcMap = prevArcMapRef.current
    const arcByAddr = new Map<Address, (typeof arcs)[number]>()
    for (const arc of arcs) arcByAddr.set(arc.address, arc)

    // Base sequencing (all phases start after globalDelayMs):
    // - removal: collapse removed (tweenMs) -> fill gap (tweenMs)
    // - addition: (if no removal) existing arcs tween first (tweenMs), then new arc draws
    // - swap: collapse removed -> fill gap -> draw new
    const collapseStartMs = removed.length > 0 ? globalDelayMs : 0
    const fillGapStartMs = removed.length > 0 ? globalDelayMs + tweenMs : 0
    const addDrawDelayMs =
      removed.length > 0
        ? globalDelayMs + tweenMs * 2
        : prevCount === 0
          ? globalDelayMs
          : globalDelayMs + tweenMs
    const pulseDelayMs = addDrawDelayMs + tweenMs

    // 1) Freeze current visible circles to their previous geometry so nothing animates behind the modal.
    // For removals: freeze now, then do collapse + fill-gap later.
    // For additions (no removals): freeze now, then let existing arcs tween to their new geometry after globalDelayMs.
    if (removed.length > 0 || (removed.length === 0 && added.length > 0 && prevCount > 0)) {
      for (const addr of currentAddresses) {
        const circle = getCircle(addr)
        const prev = prevArcMap.get(addr)
        if (!circle || !prev) continue
        circle.style.transition = 'none'
        circle.setAttribute('stroke-dasharray', `${prev.dashLen} ${circumference}`)
        circle.setAttribute('stroke-dashoffset', prev.dashOffset.toString())
      }

      // Force a flush so subsequent updates will animate.
      void svg.getBoundingClientRect()

      if (removed.length === 0 && added.length > 0 && prevCount > 0) {
        timeouts.push(
          window.setTimeout(() => {
            for (const arc of arcs) {
              const circle = getCircle(arc.address)
              if (!circle) continue
              circle.style.removeProperty('transition')
              circle.setAttribute('stroke-dasharray', `${arc.dashLen} ${circumference}`)
              circle.setAttribute('stroke-dashoffset', arc.dashOffset.toString())
            }
          }, globalDelayMs)
        )
      }
    }

    // 2) If removing, create temporary circles for removed segments and animate them to 0.
    const tempRemovedCircles: SVGCircleElement[] = []
    if (removed.length > 0) {
      for (const addr of removed) {
        const prev = prevArcMap.get(addr)
        if (!prev) continue

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('class', 'balArc')
        circle.setAttribute('cx', cx.toString())
        circle.setAttribute('cy', cy.toString())
        circle.setAttribute('data-temp', '1')
        circle.setAttribute('fill', 'none')
        circle.setAttribute('r', midR.toString())
        circle.setAttribute('stroke', `url(#${prev.gradientId})`)
        circle.setAttribute('stroke-dasharray', `${prev.dashLen} ${circumference}`)
        circle.setAttribute('stroke-dashoffset', prev.dashOffset.toString())
        circle.setAttribute('stroke-linecap', 'butt')
        circle.setAttribute('stroke-width', strokeW.toString())
        circle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`)

        arcsGroup.appendChild(circle)
        tempRemovedCircles.push(circle)
      }

      // Force flush so the subsequent dasharray change transitions.
      void arcsGroup.getBoundingClientRect()

      // Start collapse after global delay.
      timeouts.push(
        window.setTimeout(() => {
          for (const circle of tempRemovedCircles) {
            circle.setAttribute('stroke-dasharray', `0 ${circumference}`)
          }
        }, collapseStartMs)
      )

      // Remove temporary circles after collapse completes.
      timeouts.push(
        window.setTimeout(() => {
          for (const circle of tempRemovedCircles) circle.remove()
        }, collapseStartMs + tweenMs)
      )

      // After collapse, let remaining circles transition to new geometry (fill the gap).
      timeouts.push(
        window.setTimeout(() => {
          for (const arc of arcs) {
            const circle = getCircle(arc.address)
            if (!circle) continue
            circle.style.removeProperty('transition')
            circle.setAttribute('stroke-dasharray', `${arc.dashLen} ${circumference}`)
            circle.setAttribute('stroke-dashoffset', arc.dashOffset.toString())
          }
        }, fillGapStartMs)
      )
    }

    // 3) For added tokens: hide immediately (so they don't appear before their draw starts).
    for (const addr of added) {
      const circle = getCircle(addr)
      if (!circle) continue
      circle.style.opacity = '0'
      circle.style.animation = 'none'
      hiddenAdded.push(addr)
    }

    const startDraw = () => {
      for (const addr of added) {
        const circle = getCircle(addr)
        if (!circle) continue

        // Always unhide (even if we can't animate for some reason).
        circle.style.opacity = '1'

        const arc = arcByAddr.get(addr)
        if (!arc) continue
        const targetDasharray = `${arc.dashLen} ${circumference}`

        circle.style.transition = 'none'
        circle.setAttribute('stroke-dasharray', `0 ${circumference}`)
        circle.setAttribute('stroke-dashoffset', arc.dashOffset.toString())
        // Force style flush so next change transitions.
        void circle.getBoundingClientRect()
        circle.style.removeProperty('transition')

        requestAnimationFrame(() => {
          circle.setAttribute('stroke-dasharray', targetDasharray)
        })
      }
    }

    const startPulse = () => {
      for (const addr of added) {
        const circle = getCircle(addr)
        if (!circle) continue

        circle.style.animation = 'none'
        void circle.getBoundingClientRect()
        circle.style.animation = `balArcPulse ${pulseCycleMs}ms var(--ease-out-cubic) 0ms ${pulseIterations}`
      }
    }

    if (added.length > 0) {
      timeouts.push(window.setTimeout(startDraw, addDrawDelayMs))

      // Always pulse on addition, including the first token.
      timeouts.push(window.setTimeout(startPulse, pulseDelayMs))
    }

    // Persist the "previous" state for the next diff calculation.
    prevAddressesRef.current = currentAddresses
    prevCountRef.current = currentAddresses.length

    return () => {
      for (const id of timeouts) window.clearTimeout(id)

      // If the animation sequence was interrupted, restore any arcs we temporarily hid.
      for (const addr of hiddenAdded) {
        const circle = getCircle(addr)
        if (!circle) continue
        circle.style.removeProperty('opacity')
        circle.style.removeProperty('animation')
      }

      // Remove any temporary removed circles that might still be present.
      for (const el of Array.from(svg.querySelectorAll('circle[data-temp="1"]'))) {
        el.remove()
      }
    }
  }, [animationTrigger, circumference])

  const isWeighted = !!tokenWeights

  const updateHoverPoint = (e: MouseEvent<SVGCircleElement>, index: number) => {
    setHoveredIndex(index)
    setHoverClientPoint({ x: e.clientX, y: e.clientY })
  }

  const clearHover = () => {
    setHoveredIndex(null)
    setHoverClientPoint(null)
  }

  const tooltipPortal =
    hoveredIndex !== null && hoverClientPoint && typeof document !== 'undefined'
      ? (() => {
          const symbol = tokenSymbols?.[hoveredIndex] || ''
          const header = symbol || normalizedAddresses[hoveredIndex] || ''
          const pct = isWeighted ? `${(fractions[hoveredIndex] * 100).toFixed(2)}%` : ''
          const showPct = isWeighted && pct.length > 0

          const padding = 12
          const gapY = 5

          const estCharW = 7.5
          const estW = Math.max(
            120,
            Math.ceil(Math.max(header.length, pct.length) * estCharW) + padding * 2
          )
          const estH = padding * 2 + 18 + (showPct ? gapY + 16 : 0)

          let left = hoverClientPoint.x + 12
          let top = hoverClientPoint.y - 12 - estH

          if (typeof window !== 'undefined') {
            left = Math.max(8, Math.min(window.innerWidth - estW - 8, left))
            top = Math.max(8, Math.min(window.innerHeight - estH - 8, top))
          }

          return createPortal(
            <div
              style={{
                position: 'fixed',
                left,
                top,
                zIndex: 10000,
                pointerEvents: 'none',
                background: 'var(--chakra-colors-background-level0)',
                border: '0.5px solid var(--chakra-colors-border-base)',
                borderRadius: 8,
                padding,
                opacity: 0.98,
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                color: 'var(--chakra-colors-font-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: '18px' }}>{header}</div>
              {showPct ? (
                <div
                  style={{
                    marginTop: gapY,
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: '16px',
                    color: 'var(--chakra-colors-font-secondary)',
                  }}
                >
                  {pct}
                </div>
              ) : null}
            </div>,
            document.body
          )
        })()
      : null

  return (
    <>
      <svg
        fill="none"
        height="150"
        ref={svgRef}
        viewBox="0 0 155 155"
        width="150"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <style>{`
        .balArc {
          transition: stroke-dasharray ${tweenMs}ms var(--ease-out-cubic), stroke-dashoffset ${tweenMs}ms var(--ease-out-cubic);
        }
        @keyframes balArcPulse {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

        {normalizedAddresses.length === 0 ? (
          <g>
            <path
              d={fullDonutPath(cx, cy, outerR, innerR, startAngleBase)}
              fill="var(--chakra-colors-background-level0)"
              filter="url(#emptyInnerShadow)"
            />
          </g>
        ) : (
          <g data-layer="arcs">
            <circle
              cx={cx}
              cy={cy}
              fill="none"
              pointerEvents="none"
              r={midR}
              stroke="var(--chakra-colors-background-level0)"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              strokeWidth={strokeW}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {arcs.map(arc => (
              <circle
                className="balArc"
                cx={cx}
                cy={cy}
                data-addr={arc.address}
                fill="none"
                key={arc.gradientId}
                onMouseEnter={e => updateHoverPoint(e, arc.i)}
                onMouseLeave={clearHover}
                onMouseMove={e => updateHoverPoint(e, arc.i)}
                r={midR}
                stroke={`url(#${arc.gradientId})`}
                strokeDasharray={`${arc.dashLen} ${circumference}`}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="butt"
                strokeWidth={strokeW}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}
          </g>
        )}

        <defs>
          {arcs.map(arc => (
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={arc.gradientId}
              key={arc.gradientId}
              x1="0"
              x2="0"
              y1="1"
              y2="151"
            >
              <stop stopColor={arc.from} />
              <stop offset="1" stopColor={arc.to} />
            </linearGradient>
          ))}

          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="155"
            id="emptyInnerShadow"
            width="155"
            x="0"
            y="0"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite
              in2="hardAlpha"
              k2="-1"
              k3="1"
              operator="arithmetic"
              result="innerShadow"
            />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0" />
            <feBlend in="shape" in2="innerShadow" mode="normal" result="effect1_innerShadow" />
          </filter>

          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="211"
            id="filter0_dddddddd_235_8770"
            width="136"
            x="0"
            y="0"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius="1"
              result="effect1_dropShadow_235_8770"
            />
            <feOffset />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_235_8770" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="0.5"
              result="effect2_dropShadow_235_8770"
            />
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect1_dropShadow_235_8770"
              mode="normal"
              result="effect2_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="1.5"
              result="effect3_dropShadow_235_8770"
            />
            <feOffset dx="3" dy="3" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect2_dropShadow_235_8770"
              mode="normal"
              result="effect3_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="3"
              result="effect4_dropShadow_235_8770"
            />
            <feOffset dx="6" dy="6" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect3_dropShadow_235_8770"
              mode="normal"
              result="effect4_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="6"
              result="effect5_dropShadow_235_8770"
            />
            <feOffset dx="12" dy="12" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect4_dropShadow_235_8770"
              mode="normal"
              result="effect5_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="12"
              result="effect6_dropShadow_235_8770"
            />
            <feOffset dx="24" dy="24" />
            <feGaussianBlur stdDeviation="12" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect5_dropShadow_235_8770"
              mode="normal"
              result="effect6_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="24"
              result="effect7_dropShadow_235_8770"
            />
            <feOffset dx="42" dy="42" />
            <feGaussianBlur stdDeviation="21" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect6_dropShadow_235_8770"
              mode="normal"
              result="effect7_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dx="-0.5" dy="-0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0" />
            <feBlend
              in2="effect7_dropShadow_235_8770"
              mode="normal"
              result="effect8_dropShadow_235_8770"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect8_dropShadow_235_8770"
              mode="normal"
              result="shape"
            />
          </filter>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
            height="211"
            id="filter1_dddddddd_235_8770"
            width="136"
            x="75"
            y="0"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius="1"
              result="effect1_dropShadow_235_8770"
            />
            <feOffset />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_235_8770" />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="0.5"
              result="effect2_dropShadow_235_8770"
            />
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect1_dropShadow_235_8770"
              mode="normal"
              result="effect2_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="1.5"
              result="effect3_dropShadow_235_8770"
            />
            <feOffset dx="3" dy="3" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect2_dropShadow_235_8770"
              mode="normal"
              result="effect3_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="3"
              result="effect4_dropShadow_235_8770"
            />
            <feOffset dx="6" dy="6" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect3_dropShadow_235_8770"
              mode="normal"
              result="effect4_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="6"
              result="effect5_dropShadow_235_8770"
            />
            <feOffset dx="12" dy="12" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect4_dropShadow_235_8770"
              mode="normal"
              result="effect5_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="12"
              result="effect6_dropShadow_235_8770"
            />
            <feOffset dx="24" dy="24" />
            <feGaussianBlur stdDeviation="12" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect5_dropShadow_235_8770"
              mode="normal"
              result="effect6_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feMorphology
              in="SourceAlpha"
              operator="erode"
              radius="24"
              result="effect7_dropShadow_235_8770"
            />
            <feOffset dx="42" dy="42" />
            <feGaussianBlur stdDeviation="21" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
            <feBlend
              in2="effect6_dropShadow_235_8770"
              mode="normal"
              result="effect7_dropShadow_235_8770"
            />
            <feColorMatrix
              in="SourceAlpha"
              result="hardAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dx="-0.5" dy="-0.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0" />
            <feBlend
              in2="effect7_dropShadow_235_8770"
              mode="normal"
              result="effect8_dropShadow_235_8770"
            />
            <feBlend
              in="SourceGraphic"
              in2="effect8_dropShadow_235_8770"
              mode="normal"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
      {tooltipPortal}
    </>
  )
}

export function CurrentPriceMinusFivePercentSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 71 40"
      width="71"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line
        stroke="#A0AEC0"
        strokeOpacity="0.4"
        x1="0.833313"
        x2="0.833311"
        y1="2.18557e-08"
        y2="40"
      />
      <line stroke="#A0AEC0" strokeOpacity="0.4" x1="0.333313" x2="70.3333" y1="39.5" y2="39.5" />
      <path
        d="M37.3333 17.4996L37.7249 16.8599L37.5446 16.7496H37.3333V17.4996ZM64.237 33.9668L60.1007 26.3582L55.5796 33.7446L64.237 33.9668ZM6.83331 17.4996V18.2496H37.3333V17.4996V16.7496H6.83331V17.4996ZM37.3333 17.4996L36.9418 18.1393L58.0883 31.0826L58.4798 30.4429L58.8714 29.8033L37.7249 16.8599L37.3333 17.4996Z"
        fill="url(#paint0_linear_235_9172)"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9172"
          x1="35.5352"
          x2="35.5352"
          y1="17.4996"
          y2="33.9668"
        >
          <stop stopColor="#F48975" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F48975" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function CurrentPriceSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 70 40"
      width="70"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line stroke="#A0AEC0" strokeOpacity="0.4" x1="0.5" x2="0.499998" y1="2.18557e-08" y2="40" />
      <line stroke="#A0AEC0" strokeOpacity="0.4" x1="4.37114e-08" x2="70" y1="39.5" y2="39.5" />
      <path
        d="M65 17.4996L57.5 13.1695V21.8298L65 17.4996ZM6.5 17.4996V18.2496C6.51977 18.2496 6.5396 18.2496 6.5595 18.2496C6.5794 18.2496 6.59935 18.2496 6.61938 18.2496C6.6394 18.2496 6.65948 18.2496 6.67962 18.2496C6.69977 18.2496 6.71998 18.2496 6.74025 18.2496C6.76052 18.2496 6.78085 18.2496 6.80124 18.2496C6.82163 18.2496 6.84209 18.2496 6.8626 18.2496C6.88312 18.2496 6.9037 18.2496 6.92433 18.2496C6.94497 18.2496 6.96567 18.2496 6.98643 18.2496C7.00719 18.2496 7.02802 18.2496 7.0489 18.2496C7.06978 18.2496 7.09073 18.2496 7.11173 18.2496C7.13274 18.2496 7.1538 18.2496 7.17493 18.2496C7.19605 18.2496 7.21724 18.2496 7.23848 18.2496C7.25973 18.2496 7.28104 18.2496 7.3024 18.2496C7.32377 18.2496 7.3452 18.2496 7.36668 18.2496C7.38817 18.2496 7.40971 18.2496 7.43132 18.2496C7.45292 18.2496 7.47459 18.2496 7.49631 18.2496C7.51804 18.2496 7.53982 18.2496 7.56167 18.2496C7.58351 18.2496 7.60541 18.2496 7.62737 18.2496C7.64934 18.2496 7.67136 18.2496 7.69343 18.2496C7.71551 18.2496 7.73765 18.2496 7.75985 18.2496C7.78204 18.2496 7.8043 18.2496 7.82661 18.2496C7.84893 18.2496 7.8713 18.2496 7.89373 18.2496C7.91616 18.2496 7.93865 18.2496 7.96119 18.2496C7.98374 18.2496 8.00634 18.2496 8.029 18.2496C8.05167 18.2496 8.07438 18.2496 8.09716 18.2496C8.11994 18.2496 8.14277 18.2496 8.16566 18.2496C8.18856 18.2496 8.21151 18.2496 8.23451 18.2496C8.25752 18.2496 8.28058 18.2496 8.3037 18.2496C8.32682 18.2496 8.35 18.2496 8.37323 18.2496C8.39647 18.2496 8.41976 18.2496 8.4431 18.2496C8.46645 18.2496 8.48985 18.2496 8.51331 18.2496C8.53677 18.2496 8.56029 18.2496 8.58386 18.2496C8.60743 18.2496 8.63106 18.2496 8.65474 18.2496C8.67843 18.2496 8.70217 18.2496 8.72596 18.2496C8.74976 18.2496 8.77361 18.2496 8.79752 18.2496C8.82142 18.2496 8.84539 18.2496 8.8694 18.2496C8.89342 18.2496 8.91749 18.2496 8.94162 18.2496C8.96575 18.2496 8.98993 18.2496 9.01417 18.2496C9.0384 18.2496 9.0627 18.2496 9.08704 18.2496C9.11139 18.2496 9.13579 18.2496 9.16025 18.2496C9.1847 18.2496 9.20921 18.2496 9.23378 18.2496C9.25834 18.2496 9.28296 18.2496 9.30763 18.2496C9.3323 18.2496 9.35703 18.2496 9.38181 18.2496C9.40659 18.2496 9.43142 18.2496 9.45631 18.2496C9.4812 18.2496 9.50614 18.2496 9.53114 18.2496C9.55613 18.2496 9.58118 18.2496 9.60628 18.2496C9.63138 18.2496 9.65653 18.2496 9.68174 18.2496C9.70695 18.2496 9.73221 18.2496 9.75752 18.2496C9.78283 18.2496 9.8082 18.2496 9.83362 18.2496C9.85903 18.2496 9.8845 18.2496 9.91003 18.2496C9.93555 18.2496 9.96113 18.2496 9.98675 18.2496C10.0124 18.2496 10.0381 18.2496 10.0638 18.2496C10.0895 18.2496 10.1153 18.2496 10.1411 18.2496C10.167 18.2496 10.1929 18.2496 10.2188 18.2496C10.2447 18.2496 10.2707 18.2496 10.2968 18.2496C10.3228 18.2496 10.3489 18.2496 10.375 18.2496C10.4012 18.2496 10.4274 18.2496 10.4536 18.2496C10.4799 18.2496 10.5062 18.2496 10.5325 18.2496C10.5589 18.2496 10.5853 18.2496 10.6117 18.2496C10.6382 18.2496 10.6646 18.2496 10.6912 18.2496C10.7177 18.2496 10.7443 18.2496 10.771 18.2496C10.7976 18.2496 10.8243 18.2496 10.8511 18.2496C10.8778 18.2496 10.9046 18.2496 10.9315 18.2496C10.9583 18.2496 10.9852 18.2496 11.0122 18.2496C11.0391 18.2496 11.0661 18.2496 11.0932 18.2496C11.1202 18.2496 11.1473 18.2496 11.1744 18.2496C11.2016 18.2496 11.2288 18.2496 11.256 18.2496C11.2833 18.2496 11.3106 18.2496 11.3379 18.2496C11.3652 18.2496 11.3926 18.2496 11.4201 18.2496C11.4475 18.2496 11.475 18.2496 11.5025 18.2496C11.53 18.2496 11.5576 18.2496 11.5852 18.2496C11.6129 18.2496 11.6406 18.2496 11.6683 18.2496C11.696 18.2496 11.7238 18.2496 11.7516 18.2496C11.7794 18.2496 11.8073 18.2496 11.8352 18.2496C11.8631 18.2496 11.8911 18.2496 11.9191 18.2496C11.9471 18.2496 11.9751 18.2496 12.0032 18.2496C12.0313 18.2496 12.0595 18.2496 12.0877 18.2496C12.1159 18.2496 12.1441 18.2496 12.1724 18.2496C12.2007 18.2496 12.229 18.2496 12.2574 18.2496C12.2858 18.2496 12.3142 18.2496 12.3427 18.2496C12.3712 18.2496 12.3997 18.2496 12.4283 18.2496C12.4568 18.2496 12.4854 18.2496 12.5141 18.2496C12.5428 18.2496 12.5715 18.2496 12.6002 18.2496C12.629 18.2496 12.6578 18.2496 12.6866 18.2496C12.7154 18.2496 12.7443 18.2496 12.7733 18.2496C12.8022 18.2496 12.8312 18.2496 12.8602 18.2496C12.8892 18.2496 12.9183 18.2496 12.9474 18.2496C12.9765 18.2496 13.0056 18.2496 13.0348 18.2496C13.064 18.2496 13.0933 18.2496 13.1226 18.2496C13.1518 18.2496 13.1812 18.2496 13.2105 18.2496C13.2399 18.2496 13.2693 18.2496 13.2988 18.2496C13.3283 18.2496 13.3578 18.2496 13.3873 18.2496C13.4169 18.2496 13.4465 18.2496 13.4761 18.2496C13.5057 18.2496 13.5354 18.2496 13.5651 18.2496C13.5949 18.2496 13.6246 18.2496 13.6544 18.2496C13.6843 18.2496 13.7141 18.2496 13.744 18.2496C13.7739 18.2496 13.8038 18.2496 13.8338 18.2496C13.8638 18.2496 13.8938 18.2496 13.9239 18.2496C13.9539 18.2496 13.9841 18.2496 14.0142 18.2496C14.0444 18.2496 14.0745 18.2496 14.1048 18.2496C14.135 18.2496 14.1653 18.2496 14.1956 18.2496C14.2259 18.2496 14.2563 18.2496 14.2867 18.2496C14.3171 18.2496 14.3475 18.2496 14.378 18.2496C14.4085 18.2496 14.439 18.2496 14.4696 18.2496C14.5002 18.2496 14.5308 18.2496 14.5614 18.2496C14.5921 18.2496 14.6227 18.2496 14.6535 18.2496C14.6842 18.2496 14.715 18.2496 14.7458 18.2496C14.7766 18.2496 14.8074 18.2496 14.8383 18.2496C14.8692 18.2496 14.9002 18.2496 14.9311 18.2496C14.9621 18.2496 14.9931 18.2496 15.0242 18.2496C15.0552 18.2496 15.0863 18.2496 15.1174 18.2496C15.1486 18.2496 15.1797 18.2496 15.2109 18.2496C15.2421 18.2496 15.2734 18.2496 15.3047 18.2496C15.336 18.2496 15.3673 18.2496 15.3987 18.2496C15.43 18.2496 15.4614 18.2496 15.4929 18.2496C15.5243 18.2496 15.5558 18.2496 15.5873 18.2496C15.6189 18.2496 15.6504 18.2496 15.682 18.2496C15.7136 18.2496 15.7452 18.2496 15.7769 18.2496C15.8086 18.2496 15.8403 18.2496 15.8721 18.2496C15.9038 18.2496 15.9356 18.2496 15.9674 18.2496C15.9993 18.2496 16.0311 18.2496 16.063 18.2496C16.0949 18.2496 16.1269 18.2496 16.1588 18.2496C16.1908 18.2496 16.2228 18.2496 16.2549 18.2496C16.2869 18.2496 16.319 18.2496 16.3511 18.2496C16.3833 18.2496 16.4154 18.2496 16.4476 18.2496C16.4798 18.2496 16.5121 18.2496 16.5443 18.2496C16.5766 18.2496 16.6089 18.2496 16.6413 18.2496C16.6736 18.2496 16.706 18.2496 16.7384 18.2496C16.7708 18.2496 16.8033 18.2496 16.8358 18.2496C16.8682 18.2496 16.9008 18.2496 16.9333 18.2496C16.9659 18.2496 16.9985 18.2496 17.0311 18.2496C17.0638 18.2496 17.0964 18.2496 17.1291 18.2496C17.1618 18.2496 17.1946 18.2496 17.2273 18.2496C17.2601 18.2496 17.2929 18.2496 17.3258 18.2496C17.3586 18.2496 17.3915 18.2496 17.4244 18.2496C17.4573 18.2496 17.4902 18.2496 17.5232 18.2496C17.5562 18.2496 17.5892 18.2496 17.6223 18.2496C17.6553 18.2496 17.6884 18.2496 17.7215 18.2496C17.7546 18.2496 17.7878 18.2496 17.821 18.2496C17.8542 18.2496 17.8874 18.2496 17.9206 18.2496C17.9539 18.2496 17.9872 18.2496 18.0205 18.2496C18.0538 18.2496 18.0872 18.2496 18.1206 18.2496C18.1539 18.2496 18.1874 18.2496 18.2208 18.2496C18.2543 18.2496 18.2878 18.2496 18.3213 18.2496C18.3548 18.2496 18.3883 18.2496 18.4219 18.2496C18.4555 18.2496 18.4891 18.2496 18.5228 18.2496C18.5564 18.2496 18.5901 18.2496 18.6238 18.2496C18.6575 18.2496 18.6913 18.2496 18.725 18.2496C18.7588 18.2496 18.7926 18.2496 18.8265 18.2496C18.8603 18.2496 18.8942 18.2496 18.9281 18.2496C18.962 18.2496 18.9959 18.2496 19.0299 18.2496C19.0639 18.2496 19.0979 18.2496 19.1319 18.2496C19.1659 18.2496 19.2 18.2496 19.2341 18.2496C19.2682 18.2496 19.3023 18.2496 19.3364 18.2496C19.3706 18.2496 19.4048 18.2496 19.439 18.2496C19.4732 18.2496 19.5074 18.2496 19.5417 18.2496C19.576 18.2496 19.6103 18.2496 19.6446 18.2496C19.679 18.2496 19.7133 18.2496 19.7477 18.2496C19.7821 18.2496 19.8165 18.2496 19.851 18.2496C19.8854 18.2496 19.9199 18.2496 19.9544 18.2496C19.9889 18.2496 20.0235 18.2496 20.0581 18.2496C20.0926 18.2496 20.1272 18.2496 20.1619 18.2496C20.1965 18.2496 20.2311 18.2496 20.2658 18.2496C20.3005 18.2496 20.3352 18.2496 20.37 18.2496C20.4047 18.2496 20.4395 18.2496 20.4743 18.2496C20.5091 18.2496 20.5439 18.2496 20.5788 18.2496C20.6136 18.2496 20.6485 18.2496 20.6834 18.2496C20.7184 18.2496 20.7533 18.2496 20.7883 18.2496C20.8232 18.2496 20.8582 18.2496 20.8933 18.2496C20.9283 18.2496 20.9633 18.2496 20.9984 18.2496C21.0335 18.2496 21.0686 18.2496 21.1037 18.2496C21.1389 18.2496 21.174 18.2496 21.2092 18.2496C21.2444 18.2496 21.2796 18.2496 21.3149 18.2496C21.3501 18.2496 21.3854 18.2496 21.4207 18.2496C21.456 18.2496 21.4913 18.2496 21.5266 18.2496C21.562 18.2496 21.5974 18.2496 21.6328 18.2496C21.6682 18.2496 21.7036 18.2496 21.739 18.2496C21.7745 18.2496 21.81 18.2496 21.8455 18.2496C21.881 18.2496 21.9165 18.2496 21.9521 18.2496C21.9876 18.2496 22.0232 18.2496 22.0588 18.2496C22.0944 18.2496 22.13 18.2496 22.1657 18.2496C22.2013 18.2496 22.237 18.2496 22.2727 18.2496C22.3084 18.2496 22.3442 18.2496 22.3799 18.2496C22.4157 18.2496 22.4515 18.2496 22.4873 18.2496C22.5231 18.2496 22.5589 18.2496 22.5948 18.2496C22.6306 18.2496 22.6665 18.2496 22.7024 18.2496C22.7383 18.2496 22.7742 18.2496 22.8102 18.2496C22.8461 18.2496 22.8821 18.2496 22.9181 18.2496C22.9541 18.2496 22.9901 18.2496 23.0261 18.2496C23.0622 18.2496 23.0982 18.2496 23.1343 18.2496C23.1704 18.2496 23.2065 18.2496 23.2427 18.2496C23.2788 18.2496 23.315 18.2496 23.3511 18.2496C23.3873 18.2496 23.4235 18.2496 23.4598 18.2496C23.496 18.2496 23.5322 18.2496 23.5685 18.2496C23.6048 18.2496 23.6411 18.2496 23.6774 18.2496C23.7137 18.2496 23.75 18.2496 23.7864 18.2496C23.8228 18.2496 23.8591 18.2496 23.8955 18.2496C23.932 18.2496 23.9684 18.2496 24.0048 18.2496C24.0413 18.2496 24.0777 18.2496 24.1142 18.2496C24.1507 18.2496 24.1872 18.2496 24.2238 18.2496C24.2603 18.2496 24.2968 18.2496 24.3334 18.2496C24.37 18.2496 24.4066 18.2496 24.4432 18.2496C24.4798 18.2496 24.5165 18.2496 24.5531 18.2496C24.5898 18.2496 24.6264 18.2496 24.6631 18.2496C24.6998 18.2496 24.7366 18.2496 24.7733 18.2496C24.81 18.2496 24.8468 18.2496 24.8836 18.2496C24.9203 18.2496 24.9571 18.2496 24.994 18.2496C25.0308 18.2496 25.0676 18.2496 25.1045 18.2496C25.1413 18.2496 25.1782 18.2496 25.2151 18.2496C25.252 18.2496 25.2889 18.2496 25.3258 18.2496C25.3628 18.2496 25.3997 18.2496 25.4367 18.2496C25.4737 18.2496 25.5107 18.2496 25.5477 18.2496C25.5847 18.2496 25.6217 18.2496 25.6587 18.2496C25.6958 18.2496 25.7328 18.2496 25.7699 18.2496C25.807 18.2496 25.8441 18.2496 25.8812 18.2496C25.9183 18.2496 25.9555 18.2496 25.9926 18.2496C26.0298 18.2496 26.067 18.2496 26.1041 18.2496C26.1413 18.2496 26.1785 18.2496 26.2158 18.2496C26.253 18.2496 26.2902 18.2496 26.3275 18.2496C26.3647 18.2496 26.402 18.2496 26.4393 18.2496C26.4766 18.2496 26.5139 18.2496 26.5512 18.2496C26.5886 18.2496 26.6259 18.2496 26.6633 18.2496C26.7006 18.2496 26.738 18.2496 26.7754 18.2496C26.8128 18.2496 26.8502 18.2496 26.8876 18.2496C26.925 18.2496 26.9625 18.2496 26.9999 18.2496C27.0374 18.2496 27.0749 18.2496 27.1123 18.2496C27.1498 18.2496 27.1873 18.2496 27.2249 18.2496C27.2624 18.2496 27.2999 18.2496 27.3375 18.2496C27.375 18.2496 27.4126 18.2496 27.4501 18.2496C27.4877 18.2496 27.5253 18.2496 27.5629 18.2496C27.6005 18.2496 27.6382 18.2496 27.6758 18.2496C27.7134 18.2496 27.7511 18.2496 27.7888 18.2496C27.8264 18.2496 27.8641 18.2496 27.9018 18.2496C27.9395 18.2496 27.9772 18.2496 28.0149 18.2496C28.0527 18.2496 28.0904 18.2496 28.1282 18.2496C28.1659 18.2496 28.2037 18.2496 28.2415 18.2496C28.2792 18.2496 28.317 18.2496 28.3548 18.2496C28.3926 18.2496 28.4305 18.2496 28.4683 18.2496C28.5061 18.2496 28.544 18.2496 28.5818 18.2496C28.6197 18.2496 28.6576 18.2496 28.6955 18.2496C28.7333 18.2496 28.7712 18.2496 28.8091 18.2496C28.8471 18.2496 28.885 18.2496 28.9229 18.2496C28.9609 18.2496 28.9988 18.2496 29.0368 18.2496C29.0747 18.2496 29.1127 18.2496 29.1507 18.2496C29.1887 18.2496 29.2267 18.2496 29.2647 18.2496C29.3027 18.2496 29.3407 18.2496 29.3787 18.2496C29.4168 18.2496 29.4548 18.2496 29.4928 18.2496C29.5309 18.2496 29.569 18.2496 29.607 18.2496C29.6451 18.2496 29.6832 18.2496 29.7213 18.2496C29.7594 18.2496 29.7975 18.2496 29.8356 18.2496C29.8737 18.2496 29.9119 18.2496 29.95 18.2496C29.9882 18.2496 30.0263 18.2496 30.0645 18.2496C30.1026 18.2496 30.1408 18.2496 30.179 18.2496C30.2172 18.2496 30.2554 18.2496 30.2936 18.2496C30.3318 18.2496 30.37 18.2496 30.4082 18.2496C30.4464 18.2496 30.4846 18.2496 30.5229 18.2496C30.5611 18.2496 30.5994 18.2496 30.6376 18.2496C30.6759 18.2496 30.7142 18.2496 30.7524 18.2496C30.7907 18.2496 30.829 18.2496 30.8673 18.2496C30.9056 18.2496 30.9439 18.2496 30.9822 18.2496C31.0205 18.2496 31.0588 18.2496 31.0972 18.2496C31.1355 18.2496 31.1738 18.2496 31.2122 18.2496C31.2505 18.2496 31.2889 18.2496 31.3272 18.2496C31.3656 18.2496 31.404 18.2496 31.4423 18.2496C31.4807 18.2496 31.5191 18.2496 31.5575 18.2496C31.5959 18.2496 31.6343 18.2496 31.6727 18.2496C31.7111 18.2496 31.7495 18.2496 31.7879 18.2496C31.8264 18.2496 31.8648 18.2496 31.9032 18.2496C31.9417 18.2496 31.9801 18.2496 32.0186 18.2496C32.057 18.2496 32.0955 18.2496 32.1339 18.2496C32.1724 18.2496 32.2109 18.2496 32.2493 18.2496C32.2878 18.2496 32.3263 18.2496 32.3648 18.2496C32.4033 18.2496 32.4418 18.2496 32.4803 18.2496C32.5188 18.2496 32.5573 18.2496 32.5958 18.2496C32.6343 18.2496 32.6728 18.2496 32.7113 18.2496C32.7499 18.2496 32.7884 18.2496 32.8269 18.2496C32.8654 18.2496 32.904 18.2496 32.9425 18.2496C32.9811 18.2496 33.0196 18.2496 33.0582 18.2496C33.0967 18.2496 33.1353 18.2496 33.1738 18.2496C33.2124 18.2496 33.251 18.2496 33.2896 18.2496C33.3281 18.2496 33.3667 18.2496 33.4053 18.2496C33.4439 18.2496 33.4824 18.2496 33.521 18.2496C33.5596 18.2496 33.5982 18.2496 33.6368 18.2496C33.6754 18.2496 33.714 18.2496 33.7526 18.2496C33.7912 18.2496 33.8298 18.2496 33.8684 18.2496C33.907 18.2496 33.9457 18.2496 33.9843 18.2496C34.0229 18.2496 34.0615 18.2496 34.1001 18.2496C34.1388 18.2496 34.1774 18.2496 34.216 18.2496C34.2547 18.2496 34.2933 18.2496 34.3319 18.2496C34.3706 18.2496 34.4092 18.2496 34.4478 18.2496C34.4865 18.2496 34.5251 18.2496 34.5638 18.2496C34.6024 18.2496 34.641 18.2496 34.6797 18.2496C34.7183 18.2496 34.757 18.2496 34.7956 18.2496C34.8343 18.2496 34.8729 18.2496 34.9116 18.2496C34.9503 18.2496 34.9889 18.2496 35.0276 18.2496C35.0662 18.2496 35.1049 18.2496 35.1436 18.2496C35.1822 18.2496 35.2209 18.2496 35.2595 18.2496C35.2982 18.2496 35.3369 18.2496 35.3755 18.2496C35.4142 18.2496 35.4529 18.2496 35.4915 18.2496C35.5302 18.2496 35.5688 18.2496 35.6075 18.2496C35.6462 18.2496 35.6848 18.2496 35.7235 18.2496C35.7622 18.2496 35.8008 18.2496 35.8395 18.2496C35.8782 18.2496 35.9168 18.2496 35.9555 18.2496C35.9942 18.2496 36.0328 18.2496 36.0715 18.2496C36.1102 18.2496 36.1488 18.2496 36.1875 18.2496C36.2262 18.2496 36.2648 18.2496 36.3035 18.2496C36.3421 18.2496 36.3808 18.2496 36.4195 18.2496C36.4581 18.2496 36.4968 18.2496 36.5354 18.2496C36.5741 18.2496 36.6127 18.2496 36.6514 18.2496C36.69 18.2496 36.7287 18.2496 36.7673 18.2496C36.806 18.2496 36.8446 18.2496 36.8833 18.2496C36.9219 18.2496 36.9606 18.2496 36.9992 18.2496C37.0379 18.2496 37.0765 18.2496 37.1151 18.2496C37.1538 18.2496 37.1924 18.2496 37.231 18.2496C37.2697 18.2496 37.3083 18.2496 37.3469 18.2496C37.3856 18.2496 37.4242 18.2496 37.4628 18.2496C37.5014 18.2496 37.54 18.2496 37.5787 18.2496C37.6173 18.2496 37.6559 18.2496 37.6945 18.2496C37.7331 18.2496 37.7717 18.2496 37.8103 18.2496C37.8489 18.2496 37.8875 18.2496 37.9261 18.2496C37.9647 18.2496 38.0033 18.2496 38.0418 18.2496C38.0804 18.2496 38.119 18.2496 38.1576 18.2496C38.1962 18.2496 38.2347 18.2496 38.2733 18.2496C38.3119 18.2496 38.3504 18.2496 38.389 18.2496C38.4276 18.2496 38.4661 18.2496 38.5047 18.2496C38.5432 18.2496 38.5817 18.2496 38.6203 18.2496C38.6588 18.2496 38.6974 18.2496 38.7359 18.2496C38.7744 18.2496 38.8129 18.2496 38.8514 18.2496C38.89 18.2496 38.9285 18.2496 38.967 18.2496C39.0055 18.2496 39.044 18.2496 39.0825 18.2496C39.121 18.2496 39.1595 18.2496 39.1979 18.2496C39.2364 18.2496 39.2749 18.2496 39.3134 18.2496C39.3518 18.2496 39.3903 18.2496 39.4288 18.2496C39.4672 18.2496 39.5057 18.2496 39.5441 18.2496C39.5825 18.2496 39.621 18.2496 39.6594 18.2496C39.6978 18.2496 39.7363 18.2496 39.7747 18.2496C39.8131 18.2496 39.8515 18.2496 39.8899 18.2496C39.9283 18.2496 39.9667 18.2496 40.0051 18.2496C40.0434 18.2496 40.0818 18.2496 40.1202 18.2496C40.1586 18.2496 40.1969 18.2496 40.2353 18.2496C40.2736 18.2496 40.312 18.2496 40.3503 18.2496C40.3886 18.2496 40.427 18.2496 40.4653 18.2496C40.5036 18.2496 40.5419 18.2496 40.5802 18.2496C40.6185 18.2496 40.6568 18.2496 40.6951 18.2496C40.7334 18.2496 40.7717 18.2496 40.8099 18.2496C40.8482 18.2496 40.8865 18.2496 40.9247 18.2496C40.963 18.2496 41.0012 18.2496 41.0394 18.2496C41.0777 18.2496 41.1159 18.2496 41.1541 18.2496C41.1923 18.2496 41.2305 18.2496 41.2687 18.2496C41.3069 18.2496 41.3451 18.2496 41.3832 18.2496C41.4214 18.2496 41.4596 18.2496 41.4977 18.2496C41.5359 18.2496 41.574 18.2496 41.6121 18.2496C41.6503 18.2496 41.6884 18.2496 41.7265 18.2496C41.7646 18.2496 41.8027 18.2496 41.8408 18.2496C41.8789 18.2496 41.9169 18.2496 41.955 18.2496C41.9931 18.2496 42.0311 18.2496 42.0692 18.2496C42.1072 18.2496 42.1452 18.2496 42.1832 18.2496C42.2213 18.2496 42.2593 18.2496 42.2973 18.2496C42.3353 18.2496 42.3732 18.2496 42.4112 18.2496C42.4492 18.2496 42.4871 18.2496 42.5251 18.2496C42.563 18.2496 42.601 18.2496 42.6389 18.2496C42.6768 18.2496 42.7147 18.2496 42.7526 18.2496C42.7905 18.2496 42.8284 18.2496 42.8663 18.2496C42.9041 18.2496 42.942 18.2496 42.9799 18.2496C43.0177 18.2496 43.0555 18.2496 43.0933 18.2496C43.1312 18.2496 43.169 18.2496 43.2068 18.2496C43.2446 18.2496 43.2823 18.2496 43.3201 18.2496C43.3579 18.2496 43.3956 18.2496 43.4334 18.2496C43.4711 18.2496 43.5088 18.2496 43.5465 18.2496C43.5842 18.2496 43.6219 18.2496 43.6596 18.2496C43.6973 18.2496 43.735 18.2496 43.7726 18.2496C43.8103 18.2496 43.8479 18.2496 43.8855 18.2496C43.9231 18.2496 43.9608 18.2496 43.9983 18.2496C44.0359 18.2496 44.0735 18.2496 44.1111 18.2496C44.1486 18.2496 44.1862 18.2496 44.2237 18.2496C44.2613 18.2496 44.2988 18.2496 44.3363 18.2496C44.3738 18.2496 44.4113 18.2496 44.4487 18.2496C44.4862 18.2496 44.5237 18.2496 44.5611 18.2496C44.5985 18.2496 44.636 18.2496 44.6734 18.2496C44.7108 18.2496 44.7482 18.2496 44.7855 18.2496C44.8229 18.2496 44.8603 18.2496 44.8976 18.2496C44.9349 18.2496 44.9723 18.2496 45.0096 18.2496C45.0469 18.2496 45.0842 18.2496 45.1214 18.2496C45.1587 18.2496 45.196 18.2496 45.2332 18.2496C45.2705 18.2496 45.3077 18.2496 45.3449 18.2496C45.3821 18.2496 45.4193 18.2496 45.4564 18.2496C45.4936 18.2496 45.5308 18.2496 45.5679 18.2496C45.605 18.2496 45.6422 18.2496 45.6792 18.2496C45.7163 18.2496 45.7534 18.2496 45.7905 18.2496C45.8275 18.2496 45.8646 18.2496 45.9016 18.2496C45.9386 18.2496 45.9756 18.2496 46.0126 18.2496C46.0496 18.2496 46.0866 18.2496 46.1235 18.2496C46.1605 18.2496 46.1974 18.2496 46.2343 18.2496C46.2712 18.2496 46.3081 18.2496 46.345 18.2496C46.3819 18.2496 46.4187 18.2496 46.4556 18.2496C46.4924 18.2496 46.5292 18.2496 46.566 18.2496C46.6028 18.2496 46.6396 18.2496 46.6763 18.2496C46.7131 18.2496 46.7498 18.2496 46.7866 18.2496C46.8233 18.2496 46.86 18.2496 46.8966 18.2496C46.9333 18.2496 46.97 18.2496 47.0066 18.2496C47.0432 18.2496 47.0799 18.2496 47.1165 18.2496C47.153 18.2496 47.1896 18.2496 47.2262 18.2496C47.2627 18.2496 47.2992 18.2496 47.3358 18.2496C47.3723 18.2496 47.4088 18.2496 47.4452 18.2496C47.4817 18.2496 47.5181 18.2496 47.5546 18.2496C47.591 18.2496 47.6274 18.2496 47.6638 18.2496C47.7001 18.2496 47.7365 18.2496 47.7728 18.2496C47.8092 18.2496 47.8455 18.2496 47.8818 18.2496C47.9181 18.2496 47.9543 18.2496 47.9906 18.2496C48.0268 18.2496 48.0631 18.2496 48.0993 18.2496C48.1355 18.2496 48.1716 18.2496 48.2078 18.2496C48.244 18.2496 48.2801 18.2496 48.3162 18.2496C48.3523 18.2496 48.3884 18.2496 48.4245 18.2496C48.4605 18.2496 48.4966 18.2496 48.5326 18.2496C48.5686 18.2496 48.6046 18.2496 48.6406 18.2496C48.6765 18.2496 48.7125 18.2496 48.7484 18.2496C48.7843 18.2496 48.8202 18.2496 48.8561 18.2496C48.892 18.2496 48.9278 18.2496 48.9637 18.2496C48.9995 18.2496 49.0353 18.2496 49.0711 18.2496C49.1068 18.2496 49.1426 18.2496 49.1783 18.2496C49.2141 18.2496 49.2498 18.2496 49.2854 18.2496C49.3211 18.2496 49.3568 18.2496 49.3924 18.2496C49.428 18.2496 49.4636 18.2496 49.4992 18.2496C49.5348 18.2496 49.5703 18.2496 49.6059 18.2496C49.6414 18.2496 49.6769 18.2496 49.7124 18.2496C49.7478 18.2496 49.7833 18.2496 49.8187 18.2496C49.8541 18.2496 49.8895 18.2496 49.9249 18.2496C49.9603 18.2496 49.9956 18.2496 50.0309 18.2496C50.0663 18.2496 50.1016 18.2496 50.1368 18.2496C50.1721 18.2496 50.2073 18.2496 50.2425 18.2496C50.2778 18.2496 50.3129 18.2496 50.3481 18.2496C50.3833 18.2496 50.4184 18.2496 50.4535 18.2496C50.4886 18.2496 50.5237 18.2496 50.5587 18.2496C50.5938 18.2496 50.6288 18.2496 50.6638 18.2496C50.6988 18.2496 50.7338 18.2496 50.7687 18.2496C50.8036 18.2496 50.8386 18.2496 50.8734 18.2496C50.9083 18.2496 50.9432 18.2496 50.978 18.2496C51.0128 18.2496 51.0476 18.2496 51.0824 18.2496C51.1172 18.2496 51.1519 18.2496 51.1866 18.2496C51.2213 18.2496 51.256 18.2496 51.2907 18.2496C51.3253 18.2496 51.36 18.2496 51.3946 18.2496C51.4292 18.2496 51.4637 18.2496 51.4983 18.2496C51.5328 18.2496 51.5673 18.2496 51.6018 18.2496C51.6363 18.2496 51.6707 18.2496 51.7051 18.2496C51.7396 18.2496 51.774 18.2496 51.8083 18.2496C51.8427 18.2496 51.877 18.2496 51.9113 18.2496C51.9456 18.2496 51.9799 18.2496 52.0141 18.2496C52.0484 18.2496 52.0826 18.2496 52.1168 18.2496C52.1509 18.2496 52.1851 18.2496 52.2192 18.2496C52.2533 18.2496 52.2874 18.2496 52.3215 18.2496C52.3555 18.2496 52.3896 18.2496 52.4235 18.2496C52.4575 18.2496 52.4915 18.2496 52.5254 18.2496C52.5594 18.2496 52.5933 18.2496 52.6271 18.2496C52.661 18.2496 52.6948 18.2496 52.7287 18.2496C52.7625 18.2496 52.7962 18.2496 52.83 18.2496C52.8637 18.2496 52.8974 18.2496 52.9311 18.2496C52.9648 18.2496 52.9984 18.2496 53.032 18.2496C53.0657 18.2496 53.0992 18.2496 53.1328 18.2496C53.1663 18.2496 53.1998 18.2496 53.2333 18.2496C53.2668 18.2496 53.3003 18.2496 53.3337 18.2496C53.3671 18.2496 53.4005 18.2496 53.4338 18.2496C53.4672 18.2496 53.5005 18.2496 53.5338 18.2496C53.5671 18.2496 53.6003 18.2496 53.6335 18.2496C53.6667 18.2496 53.6999 18.2496 53.7331 18.2496C53.7662 18.2496 53.7993 18.2496 53.8324 18.2496C53.8655 18.2496 53.8985 18.2496 53.9316 18.2496C53.9646 18.2496 53.9975 18.2496 54.0305 18.2496C54.0634 18.2496 54.0963 18.2496 54.1292 18.2496C54.1621 18.2496 54.1949 18.2496 54.2277 18.2496C54.2605 18.2496 54.2933 18.2496 54.326 18.2496C54.3588 18.2496 54.3915 18.2496 54.4241 18.2496C54.4568 18.2496 54.4894 18.2496 54.522 18.2496C54.5546 18.2496 54.5872 18.2496 54.6197 18.2496C54.6522 18.2496 54.6847 18.2496 54.7172 18.2496C54.7496 18.2496 54.782 18.2496 54.8144 18.2496C54.8468 18.2496 54.8791 18.2496 54.9114 18.2496C54.9437 18.2496 54.976 18.2496 55.0082 18.2496C55.0405 18.2496 55.0727 18.2496 55.1048 18.2496C55.137 18.2496 55.1691 18.2496 55.2012 18.2496C55.2333 18.2496 55.2653 18.2496 55.2973 18.2496C55.3293 18.2496 55.3613 18.2496 55.3932 18.2496C55.4252 18.2496 55.4571 18.2496 55.4889 18.2496C55.5208 18.2496 55.5526 18.2496 55.5844 18.2496C55.6162 18.2496 55.6479 18.2496 55.6797 18.2496C55.7114 18.2496 55.743 18.2496 55.7747 18.2496C55.8063 18.2496 55.8379 18.2496 55.8695 18.2496C55.901 18.2496 55.9325 18.2496 55.964 18.2496C55.9955 18.2496 56.0269 18.2496 56.0583 18.2496C56.0897 18.2496 56.1211 18.2496 56.1524 18.2496C56.1837 18.2496 56.215 18.2496 56.2463 18.2496C56.2775 18.2496 56.3087 18.2496 56.3399 18.2496C56.3711 18.2496 56.4022 18.2496 56.4333 18.2496C56.4644 18.2496 56.4954 18.2496 56.5264 18.2496C56.5574 18.2496 56.5884 18.2496 56.6193 18.2496C56.6502 18.2496 56.6811 18.2496 56.712 18.2496C56.7428 18.2496 56.7736 18.2496 56.8044 18.2496C56.8352 18.2496 56.8659 18.2496 56.8966 18.2496C56.9273 18.2496 56.9579 18.2496 56.9885 18.2496C57.0191 18.2496 57.0497 18.2496 57.0802 18.2496C57.1107 18.2496 57.1412 18.2496 57.1716 18.2496C57.2021 18.2496 57.2325 18.2496 57.2628 18.2496C57.2932 18.2496 57.3235 18.2496 57.3538 18.2496C57.384 18.2496 57.4143 18.2496 57.4445 18.2496C57.4746 18.2496 57.5048 18.2496 57.5349 18.2496C57.565 18.2496 57.5951 18.2496 57.6251 18.2496C57.6551 18.2496 57.6851 18.2496 57.715 18.2496C57.7449 18.2496 57.7748 18.2496 57.8047 18.2496C57.8345 18.2496 57.8643 18.2496 57.8941 18.2496C57.9239 18.2496 57.9536 18.2496 57.9833 18.2496C58.0129 18.2496 58.0426 18.2496 58.0722 18.2496C58.1017 18.2496 58.1313 18.2496 58.1608 18.2496C58.1903 18.2496 58.2198 18.2496 58.2492 18.2496V17.4996V16.7496C58.2198 16.7496 58.1903 16.7496 58.1608 16.7496C58.1313 16.7496 58.1017 16.7496 58.0722 16.7496C58.0426 16.7496 58.0129 16.7496 57.9833 16.7496C57.9536 16.7496 57.9239 16.7496 57.8941 16.7496C57.8643 16.7496 57.8345 16.7496 57.8047 16.7496C57.7748 16.7496 57.7449 16.7496 57.715 16.7496C57.6851 16.7496 57.6551 16.7496 57.6251 16.7496C57.5951 16.7496 57.565 16.7496 57.5349 16.7496C57.5048 16.7496 57.4746 16.7496 57.4445 16.7496C57.4143 16.7496 57.384 16.7496 57.3538 16.7496C57.3235 16.7496 57.2932 16.7496 57.2628 16.7496C57.2325 16.7496 57.2021 16.7496 57.1716 16.7496C57.1412 16.7496 57.1107 16.7496 57.0802 16.7496C57.0497 16.7496 57.0191 16.7496 56.9885 16.7496C56.9579 16.7496 56.9273 16.7496 56.8966 16.7496C56.8659 16.7496 56.8352 16.7496 56.8044 16.7496C56.7736 16.7496 56.7428 16.7496 56.712 16.7496C56.6811 16.7496 56.6502 16.7496 56.6193 16.7496C56.5884 16.7496 56.5574 16.7496 56.5264 16.7496C56.4954 16.7496 56.4644 16.7496 56.4333 16.7496C56.4022 16.7496 56.3711 16.7496 56.3399 16.7496C56.3087 16.7496 56.2775 16.7496 56.2463 16.7496C56.215 16.7496 56.1837 16.7496 56.1524 16.7496C56.1211 16.7496 56.0897 16.7496 56.0583 16.7496C56.0269 16.7496 55.9955 16.7496 55.964 16.7496C55.9325 16.7496 55.901 16.7496 55.8695 16.7496C55.8379 16.7496 55.8063 16.7496 55.7747 16.7496C55.743 16.7496 55.7114 16.7496 55.6797 16.7496C55.6479 16.7496 55.6162 16.7496 55.5844 16.7496C55.5526 16.7496 55.5208 16.7496 55.4889 16.7496C55.4571 16.7496 55.4252 16.7496 55.3932 16.7496C55.3613 16.7496 55.3293 16.7496 55.2973 16.7496C55.2653 16.7496 55.2333 16.7496 55.2012 16.7496C55.1691 16.7496 55.137 16.7496 55.1048 16.7496C55.0727 16.7496 55.0405 16.7496 55.0082 16.7496C54.976 16.7496 54.9437 16.7496 54.9114 16.7496C54.8791 16.7496 54.8468 16.7496 54.8144 16.7496C54.782 16.7496 54.7496 16.7496 54.7172 16.7496C54.6847 16.7496 54.6522 16.7496 54.6197 16.7496C54.5872 16.7496 54.5546 16.7496 54.522 16.7496C54.4894 16.7496 54.4568 16.7496 54.4241 16.7496C54.3915 16.7496 54.3588 16.7496 54.326 16.7496C54.2933 16.7496 54.2605 16.7496 54.2277 16.7496C54.1949 16.7496 54.1621 16.7496 54.1292 16.7496C54.0963 16.7496 54.0634 16.7496 54.0305 16.7496C53.9975 16.7496 53.9646 16.7496 53.9316 16.7496C53.8985 16.7496 53.8655 16.7496 53.8324 16.7496C53.7993 16.7496 53.7662 16.7496 53.7331 16.7496C53.6999 16.7496 53.6667 16.7496 53.6335 16.7496C53.6003 16.7496 53.5671 16.7496 53.5338 16.7496C53.5005 16.7496 53.4672 16.7496 53.4338 16.7496C53.4005 16.7496 53.3671 16.7496 53.3337 16.7496C53.3003 16.7496 53.2668 16.7496 53.2333 16.7496C53.1998 16.7496 53.1663 16.7496 53.1328 16.7496C53.0992 16.7496 53.0657 16.7496 53.032 16.7496C52.9984 16.7496 52.9648 16.7496 52.9311 16.7496C52.8974 16.7496 52.8637 16.7496 52.83 16.7496C52.7962 16.7496 52.7625 16.7496 52.7287 16.7496C52.6948 16.7496 52.661 16.7496 52.6271 16.7496C52.5933 16.7496 52.5594 16.7496 52.5254 16.7496C52.4915 16.7496 52.4575 16.7496 52.4235 16.7496C52.3896 16.7496 52.3555 16.7496 52.3215 16.7496C52.2874 16.7496 52.2533 16.7496 52.2192 16.7496C52.1851 16.7496 52.1509 16.7496 52.1168 16.7496C52.0826 16.7496 52.0484 16.7496 52.0141 16.7496C51.9799 16.7496 51.9456 16.7496 51.9113 16.7496C51.877 16.7496 51.8427 16.7496 51.8083 16.7496C51.774 16.7496 51.7396 16.7496 51.7051 16.7496C51.6707 16.7496 51.6363 16.7496 51.6018 16.7496C51.5673 16.7496 51.5328 16.7496 51.4983 16.7496C51.4637 16.7496 51.4292 16.7496 51.3946 16.7496C51.36 16.7496 51.3253 16.7496 51.2907 16.7496C51.256 16.7496 51.2213 16.7496 51.1866 16.7496C51.1519 16.7496 51.1172 16.7496 51.0824 16.7496C51.0476 16.7496 51.0128 16.7496 50.978 16.7496C50.9432 16.7496 50.9083 16.7496 50.8734 16.7496C50.8386 16.7496 50.8036 16.7496 50.7687 16.7496C50.7338 16.7496 50.6988 16.7496 50.6638 16.7496C50.6288 16.7496 50.5938 16.7496 50.5587 16.7496C50.5237 16.7496 50.4886 16.7496 50.4535 16.7496C50.4184 16.7496 50.3833 16.7496 50.3481 16.7496C50.3129 16.7496 50.2778 16.7496 50.2425 16.7496C50.2073 16.7496 50.1721 16.7496 50.1368 16.7496C50.1016 16.7496 50.0663 16.7496 50.0309 16.7496C49.9956 16.7496 49.9603 16.7496 49.9249 16.7496C49.8895 16.7496 49.8541 16.7496 49.8187 16.7496C49.7833 16.7496 49.7478 16.7496 49.7124 16.7496C49.6769 16.7496 49.6414 16.7496 49.6059 16.7496C49.5703 16.7496 49.5348 16.7496 49.4992 16.7496C49.4636 16.7496 49.428 16.7496 49.3924 16.7496C49.3568 16.7496 49.3211 16.7496 49.2854 16.7496C49.2498 16.7496 49.2141 16.7496 49.1783 16.7496C49.1426 16.7496 49.1068 16.7496 49.0711 16.7496C49.0353 16.7496 48.9995 16.7496 48.9637 16.7496C48.9278 16.7496 48.892 16.7496 48.8561 16.7496C48.8202 16.7496 48.7843 16.7496 48.7484 16.7496C48.7125 16.7496 48.6765 16.7496 48.6406 16.7496C48.6046 16.7496 48.5686 16.7496 48.5326 16.7496C48.4966 16.7496 48.4605 16.7496 48.4245 16.7496C48.3884 16.7496 48.3523 16.7496 48.3162 16.7496C48.2801 16.7496 48.244 16.7496 48.2078 16.7496C48.1716 16.7496 48.1355 16.7496 48.0993 16.7496C48.0631 16.7496 48.0268 16.7496 47.9906 16.7496C47.9543 16.7496 47.9181 16.7496 47.8818 16.7496C47.8455 16.7496 47.8092 16.7496 47.7728 16.7496C47.7365 16.7496 47.7001 16.7496 47.6638 16.7496C47.6274 16.7496 47.591 16.7496 47.5546 16.7496C47.5181 16.7496 47.4817 16.7496 47.4452 16.7496C47.4088 16.7496 47.3723 16.7496 47.3358 16.7496C47.2992 16.7496 47.2627 16.7496 47.2262 16.7496C47.1896 16.7496 47.153 16.7496 47.1165 16.7496C47.0799 16.7496 47.0432 16.7496 47.0066 16.7496C46.97 16.7496 46.9333 16.7496 46.8966 16.7496C46.86 16.7496 46.8233 16.7496 46.7866 16.7496C46.7498 16.7496 46.7131 16.7496 46.6763 16.7496C46.6396 16.7496 46.6028 16.7496 46.566 16.7496C46.5292 16.7496 46.4924 16.7496 46.4556 16.7496C46.4187 16.7496 46.3819 16.7496 46.345 16.7496C46.3081 16.7496 46.2712 16.7496 46.2343 16.7496C46.1974 16.7496 46.1605 16.7496 46.1235 16.7496C46.0866 16.7496 46.0496 16.7496 46.0126 16.7496C45.9756 16.7496 45.9386 16.7496 45.9016 16.7496C45.8646 16.7496 45.8275 16.7496 45.7905 16.7496C45.7534 16.7496 45.7163 16.7496 45.6792 16.7496C45.6422 16.7496 45.605 16.7496 45.5679 16.7496C45.5308 16.7496 45.4936 16.7496 45.4564 16.7496C45.4193 16.7496 45.3821 16.7496 45.3449 16.7496C45.3077 16.7496 45.2705 16.7496 45.2332 16.7496C45.196 16.7496 45.1587 16.7496 45.1214 16.7496C45.0842 16.7496 45.0469 16.7496 45.0096 16.7496C44.9723 16.7496 44.9349 16.7496 44.8976 16.7496C44.8603 16.7496 44.8229 16.7496 44.7855 16.7496C44.7482 16.7496 44.7108 16.7496 44.6734 16.7496C44.636 16.7496 44.5985 16.7496 44.5611 16.7496C44.5237 16.7496 44.4862 16.7496 44.4487 16.7496C44.4113 16.7496 44.3738 16.7496 44.3363 16.7496C44.2988 16.7496 44.2613 16.7496 44.2237 16.7496C44.1862 16.7496 44.1486 16.7496 44.1111 16.7496C44.0735 16.7496 44.0359 16.7496 43.9983 16.7496C43.9608 16.7496 43.9231 16.7496 43.8855 16.7496C43.8479 16.7496 43.8103 16.7496 43.7726 16.7496C43.735 16.7496 43.6973 16.7496 43.6596 16.7496C43.6219 16.7496 43.5842 16.7496 43.5465 16.7496C43.5088 16.7496 43.4711 16.7496 43.4334 16.7496C43.3956 16.7496 43.3579 16.7496 43.3201 16.7496C43.2823 16.7496 43.2446 16.7496 43.2068 16.7496C43.169 16.7496 43.1312 16.7496 43.0933 16.7496C43.0555 16.7496 43.0177 16.7496 42.9799 16.7496C42.942 16.7496 42.9041 16.7496 42.8663 16.7496C42.8284 16.7496 42.7905 16.7496 42.7526 16.7496C42.7147 16.7496 42.6768 16.7496 42.6389 16.7496C42.601 16.7496 42.563 16.7496 42.5251 16.7496C42.4871 16.7496 42.4492 16.7496 42.4112 16.7496C42.3732 16.7496 42.3353 16.7496 42.2973 16.7496C42.2593 16.7496 42.2213 16.7496 42.1832 16.7496C42.1452 16.7496 42.1072 16.7496 42.0692 16.7496C42.0311 16.7496 41.9931 16.7496 41.955 16.7496C41.9169 16.7496 41.8789 16.7496 41.8408 16.7496C41.8027 16.7496 41.7646 16.7496 41.7265 16.7496C41.6884 16.7496 41.6503 16.7496 41.6121 16.7496C41.574 16.7496 41.5359 16.7496 41.4977 16.7496C41.4596 16.7496 41.4214 16.7496 41.3832 16.7496C41.3451 16.7496 41.3069 16.7496 41.2687 16.7496C41.2305 16.7496 41.1923 16.7496 41.1541 16.7496C41.1159 16.7496 41.0777 16.7496 41.0394 16.7496C41.0012 16.7496 40.963 16.7496 40.9247 16.7496C40.8865 16.7496 40.8482 16.7496 40.8099 16.7496C40.7717 16.7496 40.7334 16.7496 40.6951 16.7496C40.6568 16.7496 40.6185 16.7496 40.5802 16.7496C40.5419 16.7496 40.5036 16.7496 40.4653 16.7496C40.427 16.7496 40.3886 16.7496 40.3503 16.7496C40.312 16.7496 40.2736 16.7496 40.2353 16.7496C40.1969 16.7496 40.1586 16.7496 40.1202 16.7496C40.0818 16.7496 40.0434 16.7496 40.0051 16.7496C39.9667 16.7496 39.9283 16.7496 39.8899 16.7496C39.8515 16.7496 39.8131 16.7496 39.7747 16.7496C39.7363 16.7496 39.6978 16.7496 39.6594 16.7496C39.621 16.7496 39.5825 16.7496 39.5441 16.7496C39.5057 16.7496 39.4672 16.7496 39.4288 16.7496C39.3903 16.7496 39.3518 16.7496 39.3134 16.7496C39.2749 16.7496 39.2364 16.7496 39.1979 16.7496C39.1595 16.7496 39.121 16.7496 39.0825 16.7496C39.044 16.7496 39.0055 16.7496 38.967 16.7496C38.9285 16.7496 38.89 16.7496 38.8514 16.7496C38.8129 16.7496 38.7744 16.7496 38.7359 16.7496C38.6974 16.7496 38.6588 16.7496 38.6203 16.7496C38.5817 16.7496 38.5432 16.7496 38.5047 16.7496C38.4661 16.7496 38.4276 16.7496 38.389 16.7496C38.3504 16.7496 38.3119 16.7496 38.2733 16.7496C38.2347 16.7496 38.1962 16.7496 38.1576 16.7496C38.119 16.7496 38.0804 16.7496 38.0418 16.7496C38.0033 16.7496 37.9647 16.7496 37.9261 16.7496C37.8875 16.7496 37.8489 16.7496 37.8103 16.7496C37.7717 16.7496 37.7331 16.7496 37.6945 16.7496C37.6559 16.7496 37.6173 16.7496 37.5787 16.7496C37.54 16.7496 37.5014 16.7496 37.4628 16.7496C37.4242 16.7496 37.3856 16.7496 37.3469 16.7496C37.3083 16.7496 37.2697 16.7496 37.231 16.7496C37.1924 16.7496 37.1538 16.7496 37.1151 16.7496C37.0765 16.7496 37.0379 16.7496 36.9992 16.7496C36.9606 16.7496 36.9219 16.7496 36.8833 16.7496C36.8446 16.7496 36.806 16.7496 36.7673 16.7496C36.7287 16.7496 36.69 16.7496 36.6514 16.7496C36.6127 16.7496 36.5741 16.7496 36.5354 16.7496C36.4968 16.7496 36.4581 16.7496 36.4195 16.7496C36.3808 16.7496 36.3421 16.7496 36.3035 16.7496C36.2648 16.7496 36.2262 16.7496 36.1875 16.7496C36.1488 16.7496 36.1102 16.7496 36.0715 16.7496C36.0328 16.7496 35.9942 16.7496 35.9555 16.7496C35.9168 16.7496 35.8782 16.7496 35.8395 16.7496C35.8008 16.7496 35.7622 16.7496 35.7235 16.7496C35.6848 16.7496 35.6462 16.7496 35.6075 16.7496C35.5688 16.7496 35.5302 16.7496 35.4915 16.7496C35.4529 16.7496 35.4142 16.7496 35.3755 16.7496C35.3369 16.7496 35.2982 16.7496 35.2595 16.7496C35.2209 16.7496 35.1822 16.7496 35.1436 16.7496C35.1049 16.7496 35.0662 16.7496 35.0276 16.7496C34.9889 16.7496 34.9503 16.7496 34.9116 16.7496C34.8729 16.7496 34.8343 16.7496 34.7956 16.7496C34.757 16.7496 34.7183 16.7496 34.6797 16.7496C34.641 16.7496 34.6024 16.7496 34.5638 16.7496C34.5251 16.7496 34.4865 16.7496 34.4478 16.7496C34.4092 16.7496 34.3706 16.7496 34.3319 16.7496C34.2933 16.7496 34.2547 16.7496 34.216 16.7496C34.1774 16.7496 34.1388 16.7496 34.1001 16.7496C34.0615 16.7496 34.0229 16.7496 33.9843 16.7496C33.9457 16.7496 33.907 16.7496 33.8684 16.7496C33.8298 16.7496 33.7912 16.7496 33.7526 16.7496C33.714 16.7496 33.6754 16.7496 33.6368 16.7496C33.5982 16.7496 33.5596 16.7496 33.521 16.7496C33.4824 16.7496 33.4439 16.7496 33.4053 16.7496C33.3667 16.7496 33.3281 16.7496 33.2896 16.7496C33.251 16.7496 33.2124 16.7496 33.1738 16.7496C33.1353 16.7496 33.0967 16.7496 33.0582 16.7496C33.0196 16.7496 32.9811 16.7496 32.9425 16.7496C32.904 16.7496 32.8654 16.7496 32.8269 16.7496C32.7884 16.7496 32.7499 16.7496 32.7113 16.7496C32.6728 16.7496 32.6343 16.7496 32.5958 16.7496C32.5573 16.7496 32.5188 16.7496 32.4803 16.7496C32.4418 16.7496 32.4033 16.7496 32.3648 16.7496C32.3263 16.7496 32.2878 16.7496 32.2493 16.7496C32.2109 16.7496 32.1724 16.7496 32.1339 16.7496C32.0955 16.7496 32.057 16.7496 32.0186 16.7496C31.9801 16.7496 31.9417 16.7496 31.9032 16.7496C31.8648 16.7496 31.8264 16.7496 31.7879 16.7496C31.7495 16.7496 31.7111 16.7496 31.6727 16.7496C31.6343 16.7496 31.5959 16.7496 31.5575 16.7496C31.5191 16.7496 31.4807 16.7496 31.4423 16.7496C31.404 16.7496 31.3656 16.7496 31.3272 16.7496C31.2889 16.7496 31.2505 16.7496 31.2122 16.7496C31.1738 16.7496 31.1355 16.7496 31.0972 16.7496C31.0588 16.7496 31.0205 16.7496 30.9822 16.7496C30.9439 16.7496 30.9056 16.7496 30.8673 16.7496C30.829 16.7496 30.7907 16.7496 30.7524 16.7496C30.7142 16.7496 30.6759 16.7496 30.6376 16.7496C30.5994 16.7496 30.5611 16.7496 30.5229 16.7496C30.4846 16.7496 30.4464 16.7496 30.4082 16.7496C30.37 16.7496 30.3318 16.7496 30.2936 16.7496C30.2554 16.7496 30.2172 16.7496 30.179 16.7496C30.1408 16.7496 30.1026 16.7496 30.0645 16.7496C30.0263 16.7496 29.9882 16.7496 29.95 16.7496C29.9119 16.7496 29.8737 16.7496 29.8356 16.7496C29.7975 16.7496 29.7594 16.7496 29.7213 16.7496C29.6832 16.7496 29.6451 16.7496 29.607 16.7496C29.569 16.7496 29.5309 16.7496 29.4928 16.7496C29.4548 16.7496 29.4168 16.7496 29.3787 16.7496C29.3407 16.7496 29.3027 16.7496 29.2647 16.7496C29.2267 16.7496 29.1887 16.7496 29.1507 16.7496C29.1127 16.7496 29.0747 16.7496 29.0368 16.7496C28.9988 16.7496 28.9609 16.7496 28.9229 16.7496C28.885 16.7496 28.8471 16.7496 28.8091 16.7496C28.7712 16.7496 28.7333 16.7496 28.6955 16.7496C28.6576 16.7496 28.6197 16.7496 28.5818 16.7496C28.544 16.7496 28.5061 16.7496 28.4683 16.7496C28.4305 16.7496 28.3926 16.7496 28.3548 16.7496C28.317 16.7496 28.2792 16.7496 28.2415 16.7496C28.2037 16.7496 28.1659 16.7496 28.1282 16.7496C28.0904 16.7496 28.0527 16.7496 28.0149 16.7496C27.9772 16.7496 27.9395 16.7496 27.9018 16.7496C27.8641 16.7496 27.8264 16.7496 27.7888 16.7496C27.7511 16.7496 27.7134 16.7496 27.6758 16.7496C27.6382 16.7496 27.6005 16.7496 27.5629 16.7496C27.5253 16.7496 27.4877 16.7496 27.4501 16.7496C27.4126 16.7496 27.375 16.7496 27.3375 16.7496C27.2999 16.7496 27.2624 16.7496 27.2249 16.7496C27.1873 16.7496 27.1498 16.7496 27.1123 16.7496C27.0749 16.7496 27.0374 16.7496 26.9999 16.7496C26.9625 16.7496 26.925 16.7496 26.8876 16.7496C26.8502 16.7496 26.8128 16.7496 26.7754 16.7496C26.738 16.7496 26.7006 16.7496 26.6633 16.7496C26.6259 16.7496 26.5886 16.7496 26.5512 16.7496C26.5139 16.7496 26.4766 16.7496 26.4393 16.7496C26.402 16.7496 26.3647 16.7496 26.3275 16.7496C26.2902 16.7496 26.253 16.7496 26.2158 16.7496C26.1785 16.7496 26.1413 16.7496 26.1041 16.7496C26.067 16.7496 26.0298 16.7496 25.9926 16.7496C25.9555 16.7496 25.9183 16.7496 25.8812 16.7496C25.8441 16.7496 25.807 16.7496 25.7699 16.7496C25.7328 16.7496 25.6958 16.7496 25.6587 16.7496C25.6217 16.7496 25.5847 16.7496 25.5477 16.7496C25.5107 16.7496 25.4737 16.7496 25.4367 16.7496C25.3997 16.7496 25.3628 16.7496 25.3258 16.7496C25.2889 16.7496 25.252 16.7496 25.2151 16.7496C25.1782 16.7496 25.1413 16.7496 25.1045 16.7496C25.0676 16.7496 25.0308 16.7496 24.994 16.7496C24.9571 16.7496 24.9203 16.7496 24.8836 16.7496C24.8468 16.7496 24.81 16.7496 24.7733 16.7496C24.7366 16.7496 24.6998 16.7496 24.6631 16.7496C24.6264 16.7496 24.5898 16.7496 24.5531 16.7496C24.5165 16.7496 24.4798 16.7496 24.4432 16.7496C24.4066 16.7496 24.37 16.7496 24.3334 16.7496C24.2968 16.7496 24.2603 16.7496 24.2238 16.7496C24.1872 16.7496 24.1507 16.7496 24.1142 16.7496C24.0777 16.7496 24.0413 16.7496 24.0048 16.7496C23.9684 16.7496 23.932 16.7496 23.8955 16.7496C23.8591 16.7496 23.8228 16.7496 23.7864 16.7496C23.75 16.7496 23.7137 16.7496 23.6774 16.7496C23.6411 16.7496 23.6048 16.7496 23.5685 16.7496C23.5322 16.7496 23.496 16.7496 23.4598 16.7496C23.4235 16.7496 23.3873 16.7496 23.3511 16.7496C23.315 16.7496 23.2788 16.7496 23.2427 16.7496C23.2065 16.7496 23.1704 16.7496 23.1343 16.7496C23.0982 16.7496 23.0622 16.7496 23.0261 16.7496C22.9901 16.7496 22.9541 16.7496 22.9181 16.7496C22.8821 16.7496 22.8461 16.7496 22.8102 16.7496C22.7742 16.7496 22.7383 16.7496 22.7024 16.7496C22.6665 16.7496 22.6306 16.7496 22.5948 16.7496C22.5589 16.7496 22.5231 16.7496 22.4873 16.7496C22.4515 16.7496 22.4157 16.7496 22.3799 16.7496C22.3442 16.7496 22.3084 16.7496 22.2727 16.7496C22.237 16.7496 22.2013 16.7496 22.1657 16.7496C22.13 16.7496 22.0944 16.7496 22.0588 16.7496C22.0232 16.7496 21.9876 16.7496 21.9521 16.7496C21.9165 16.7496 21.881 16.7496 21.8455 16.7496C21.81 16.7496 21.7745 16.7496 21.739 16.7496C21.7036 16.7496 21.6682 16.7496 21.6328 16.7496C21.5974 16.7496 21.562 16.7496 21.5266 16.7496C21.4913 16.7496 21.456 16.7496 21.4207 16.7496C21.3854 16.7496 21.3501 16.7496 21.3149 16.7496C21.2796 16.7496 21.2444 16.7496 21.2092 16.7496C21.174 16.7496 21.1389 16.7496 21.1037 16.7496C21.0686 16.7496 21.0335 16.7496 20.9984 16.7496C20.9633 16.7496 20.9283 16.7496 20.8933 16.7496C20.8582 16.7496 20.8232 16.7496 20.7883 16.7496C20.7533 16.7496 20.7184 16.7496 20.6834 16.7496C20.6485 16.7496 20.6136 16.7496 20.5788 16.7496C20.5439 16.7496 20.5091 16.7496 20.4743 16.7496C20.4395 16.7496 20.4047 16.7496 20.37 16.7496C20.3352 16.7496 20.3005 16.7496 20.2658 16.7496C20.2311 16.7496 20.1965 16.7496 20.1619 16.7496C20.1272 16.7496 20.0926 16.7496 20.0581 16.7496C20.0235 16.7496 19.9889 16.7496 19.9544 16.7496C19.9199 16.7496 19.8854 16.7496 19.851 16.7496C19.8165 16.7496 19.7821 16.7496 19.7477 16.7496C19.7133 16.7496 19.679 16.7496 19.6446 16.7496C19.6103 16.7496 19.576 16.7496 19.5417 16.7496C19.5074 16.7496 19.4732 16.7496 19.439 16.7496C19.4048 16.7496 19.3706 16.7496 19.3364 16.7496C19.3023 16.7496 19.2682 16.7496 19.2341 16.7496C19.2 16.7496 19.1659 16.7496 19.1319 16.7496C19.0979 16.7496 19.0639 16.7496 19.0299 16.7496C18.9959 16.7496 18.962 16.7496 18.9281 16.7496C18.8942 16.7496 18.8603 16.7496 18.8265 16.7496C18.7926 16.7496 18.7588 16.7496 18.725 16.7496C18.6913 16.7496 18.6575 16.7496 18.6238 16.7496C18.5901 16.7496 18.5564 16.7496 18.5228 16.7496C18.4891 16.7496 18.4555 16.7496 18.4219 16.7496C18.3883 16.7496 18.3548 16.7496 18.3213 16.7496C18.2878 16.7496 18.2543 16.7496 18.2208 16.7496C18.1874 16.7496 18.1539 16.7496 18.1206 16.7496C18.0872 16.7496 18.0538 16.7496 18.0205 16.7496C17.9872 16.7496 17.9539 16.7496 17.9206 16.7496C17.8874 16.7496 17.8542 16.7496 17.821 16.7496C17.7878 16.7496 17.7546 16.7496 17.7215 16.7496C17.6884 16.7496 17.6553 16.7496 17.6223 16.7496C17.5892 16.7496 17.5562 16.7496 17.5232 16.7496C17.4902 16.7496 17.4573 16.7496 17.4244 16.7496C17.3915 16.7496 17.3586 16.7496 17.3258 16.7496C17.2929 16.7496 17.2601 16.7496 17.2273 16.7496C17.1946 16.7496 17.1618 16.7496 17.1291 16.7496C17.0964 16.7496 17.0638 16.7496 17.0311 16.7496C16.9985 16.7496 16.9659 16.7496 16.9333 16.7496C16.9008 16.7496 16.8682 16.7496 16.8358 16.7496C16.8033 16.7496 16.7708 16.7496 16.7384 16.7496C16.706 16.7496 16.6736 16.7496 16.6413 16.7496C16.6089 16.7496 16.5766 16.7496 16.5443 16.7496C16.5121 16.7496 16.4798 16.7496 16.4476 16.7496C16.4154 16.7496 16.3833 16.7496 16.3511 16.7496C16.319 16.7496 16.2869 16.7496 16.2549 16.7496C16.2228 16.7496 16.1908 16.7496 16.1588 16.7496C16.1269 16.7496 16.0949 16.7496 16.063 16.7496C16.0311 16.7496 15.9993 16.7496 15.9674 16.7496C15.9356 16.7496 15.9038 16.7496 15.8721 16.7496C15.8403 16.7496 15.8086 16.7496 15.7769 16.7496C15.7452 16.7496 15.7136 16.7496 15.682 16.7496C15.6504 16.7496 15.6189 16.7496 15.5873 16.7496C15.5558 16.7496 15.5243 16.7496 15.4929 16.7496C15.4614 16.7496 15.43 16.7496 15.3987 16.7496C15.3673 16.7496 15.336 16.7496 15.3047 16.7496C15.2734 16.7496 15.2421 16.7496 15.2109 16.7496C15.1797 16.7496 15.1486 16.7496 15.1174 16.7496C15.0863 16.7496 15.0552 16.7496 15.0242 16.7496C14.9931 16.7496 14.9621 16.7496 14.9311 16.7496C14.9002 16.7496 14.8692 16.7496 14.8383 16.7496C14.8074 16.7496 14.7766 16.7496 14.7458 16.7496C14.715 16.7496 14.6842 16.7496 14.6535 16.7496C14.6227 16.7496 14.5921 16.7496 14.5614 16.7496C14.5308 16.7496 14.5002 16.7496 14.4696 16.7496C14.439 16.7496 14.4085 16.7496 14.378 16.7496C14.3475 16.7496 14.3171 16.7496 14.2867 16.7496C14.2563 16.7496 14.2259 16.7496 14.1956 16.7496C14.1653 16.7496 14.135 16.7496 14.1048 16.7496C14.0745 16.7496 14.0444 16.7496 14.0142 16.7496C13.9841 16.7496 13.9539 16.7496 13.9239 16.7496C13.8938 16.7496 13.8638 16.7496 13.8338 16.7496C13.8038 16.7496 13.7739 16.7496 13.744 16.7496C13.7141 16.7496 13.6843 16.7496 13.6544 16.7496C13.6246 16.7496 13.5949 16.7496 13.5651 16.7496C13.5354 16.7496 13.5057 16.7496 13.4761 16.7496C13.4465 16.7496 13.4169 16.7496 13.3873 16.7496C13.3578 16.7496 13.3283 16.7496 13.2988 16.7496C13.2693 16.7496 13.2399 16.7496 13.2105 16.7496C13.1812 16.7496 13.1518 16.7496 13.1226 16.7496C13.0933 16.7496 13.064 16.7496 13.0348 16.7496C13.0056 16.7496 12.9765 16.7496 12.9474 16.7496C12.9183 16.7496 12.8892 16.7496 12.8602 16.7496C12.8312 16.7496 12.8022 16.7496 12.7733 16.7496C12.7443 16.7496 12.7154 16.7496 12.6866 16.7496C12.6578 16.7496 12.629 16.7496 12.6002 16.7496C12.5715 16.7496 12.5428 16.7496 12.5141 16.7496C12.4854 16.7496 12.4568 16.7496 12.4283 16.7496C12.3997 16.7496 12.3712 16.7496 12.3427 16.7496C12.3142 16.7496 12.2858 16.7496 12.2574 16.7496C12.229 16.7496 12.2007 16.7496 12.1724 16.7496C12.1441 16.7496 12.1159 16.7496 12.0877 16.7496C12.0595 16.7496 12.0313 16.7496 12.0032 16.7496C11.9751 16.7496 11.9471 16.7496 11.9191 16.7496C11.8911 16.7496 11.8631 16.7496 11.8352 16.7496C11.8073 16.7496 11.7794 16.7496 11.7516 16.7496C11.7238 16.7496 11.696 16.7496 11.6683 16.7496C11.6406 16.7496 11.6129 16.7496 11.5852 16.7496C11.5576 16.7496 11.53 16.7496 11.5025 16.7496C11.475 16.7496 11.4475 16.7496 11.4201 16.7496C11.3926 16.7496 11.3652 16.7496 11.3379 16.7496C11.3106 16.7496 11.2833 16.7496 11.256 16.7496C11.2288 16.7496 11.2016 16.7496 11.1744 16.7496C11.1473 16.7496 11.1202 16.7496 11.0932 16.7496C11.0661 16.7496 11.0391 16.7496 11.0122 16.7496C10.9852 16.7496 10.9583 16.7496 10.9315 16.7496C10.9046 16.7496 10.8778 16.7496 10.8511 16.7496C10.8243 16.7496 10.7976 16.7496 10.771 16.7496C10.7443 16.7496 10.7177 16.7496 10.6912 16.7496C10.6646 16.7496 10.6382 16.7496 10.6117 16.7496C10.5853 16.7496 10.5589 16.7496 10.5325 16.7496C10.5062 16.7496 10.4799 16.7496 10.4536 16.7496C10.4274 16.7496 10.4012 16.7496 10.375 16.7496C10.3489 16.7496 10.3228 16.7496 10.2968 16.7496C10.2707 16.7496 10.2447 16.7496 10.2188 16.7496C10.1929 16.7496 10.167 16.7496 10.1411 16.7496C10.1153 16.7496 10.0895 16.7496 10.0638 16.7496C10.0381 16.7496 10.0124 16.7496 9.98675 16.7496C9.96113 16.7496 9.93555 16.7496 9.91003 16.7496C9.8845 16.7496 9.85903 16.7496 9.83362 16.7496C9.8082 16.7496 9.78283 16.7496 9.75752 16.7496C9.73221 16.7496 9.70695 16.7496 9.68174 16.7496C9.65653 16.7496 9.63138 16.7496 9.60628 16.7496C9.58118 16.7496 9.55613 16.7496 9.53114 16.7496C9.50614 16.7496 9.4812 16.7496 9.45631 16.7496C9.43142 16.7496 9.40659 16.7496 9.38181 16.7496C9.35703 16.7496 9.3323 16.7496 9.30763 16.7496C9.28296 16.7496 9.25834 16.7496 9.23378 16.7496C9.20921 16.7496 9.1847 16.7496 9.16025 16.7496C9.13579 16.7496 9.11139 16.7496 9.08704 16.7496C9.0627 16.7496 9.0384 16.7496 9.01417 16.7496C8.98993 16.7496 8.96575 16.7496 8.94162 16.7496C8.91749 16.7496 8.89342 16.7496 8.8694 16.7496C8.84539 16.7496 8.82142 16.7496 8.79752 16.7496C8.77361 16.7496 8.74976 16.7496 8.72596 16.7496C8.70217 16.7496 8.67843 16.7496 8.65474 16.7496C8.63106 16.7496 8.60743 16.7496 8.58386 16.7496C8.56029 16.7496 8.53677 16.7496 8.51331 16.7496C8.48985 16.7496 8.46645 16.7496 8.4431 16.7496C8.41976 16.7496 8.39647 16.7496 8.37323 16.7496C8.35 16.7496 8.32682 16.7496 8.3037 16.7496C8.28058 16.7496 8.25752 16.7496 8.23451 16.7496C8.21151 16.7496 8.18856 16.7496 8.16566 16.7496C8.14277 16.7496 8.11994 16.7496 8.09716 16.7496C8.07438 16.7496 8.05167 16.7496 8.029 16.7496C8.00634 16.7496 7.98374 16.7496 7.96119 16.7496C7.93865 16.7496 7.91616 16.7496 7.89373 16.7496C7.8713 16.7496 7.84893 16.7496 7.82661 16.7496C7.8043 16.7496 7.78204 16.7496 7.75985 16.7496C7.73765 16.7496 7.71551 16.7496 7.69343 16.7496C7.67136 16.7496 7.64934 16.7496 7.62737 16.7496C7.60541 16.7496 7.58351 16.7496 7.56167 16.7496C7.53982 16.7496 7.51804 16.7496 7.49631 16.7496C7.47459 16.7496 7.45292 16.7496 7.43132 16.7496C7.40971 16.7496 7.38817 16.7496 7.36668 16.7496C7.3452 16.7496 7.32377 16.7496 7.3024 16.7496C7.28104 16.7496 7.25973 16.7496 7.23848 16.7496C7.21724 16.7496 7.19605 16.7496 7.17493 16.7496C7.1538 16.7496 7.13274 16.7496 7.11173 16.7496C7.09073 16.7496 7.06978 16.7496 7.0489 16.7496C7.02802 16.7496 7.00719 16.7496 6.98643 16.7496C6.96567 16.7496 6.94497 16.7496 6.92433 16.7496C6.9037 16.7496 6.88312 16.7496 6.8626 16.7496C6.84209 16.7496 6.82163 16.7496 6.80124 16.7496C6.78085 16.7496 6.76052 16.7496 6.74025 16.7496C6.71998 16.7496 6.69977 16.7496 6.67962 16.7496C6.65948 16.7496 6.6394 16.7496 6.61938 16.7496C6.59935 16.7496 6.5794 16.7496 6.5595 16.7496C6.5396 16.7496 6.51977 16.7496 6.5 16.7496V17.4996Z"
        fill="#A0AEC0"
      />
    </svg>
  )
}

export function CurrentPricePlusFivePercentSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 71 40"
      width="71"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line
        stroke="#A0AEC0"
        strokeOpacity="0.4"
        x1="1.16663"
        x2="1.16662"
        y1="2.18557e-08"
        y2="40"
      />
      <line stroke="#A0AEC0" strokeOpacity="0.4" x1="0.666626" x2="70.6666" y1="39.5" y2="39.5" />
      <path
        d="M37.6666 17.4996V18.2496H37.8676L38.0416 18.1492L37.6666 17.4996ZM64.5703 1.9668L55.9101 1.9668L60.2402 9.4668L64.5703 1.9668ZM7.16663 17.4996V18.2496H37.6666V17.4996V16.7496H7.16663V17.4996ZM37.6666 17.4996L38.0416 18.1492L59.0996 5.99132L58.7246 5.3418L58.3496 4.69228L37.2916 16.8501L37.6666 17.4996Z"
        fill="url(#paint0_linear_235_9192)"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9192"
          x1="35.8685"
          x2="35.8685"
          y1="1.9668"
          y2="17.4996"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function TargetRangeNarrowSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 72 40"
      width="72"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        fill="url(#paint0_linear_235_9215)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="0.833313"
        y="38"
      />
      <rect
        fill="url(#paint1_linear_235_9215)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="6.83331"
        y="38"
      />
      <rect
        fill="url(#paint2_linear_235_9215)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="12.8333"
        y="38"
      />
      <rect fill="url(#paint3_linear_235_9215)" height="40" rx="2.5" width="5" x="18.8333" />
      <rect fill="url(#paint4_linear_235_9215)" height="40" rx="2.5" width="5" x="24.8333" />
      <rect fill="url(#paint5_linear_235_9215)" height="40" rx="2.5" width="5" x="30.8333" />
      <rect fill="url(#paint6_linear_235_9215)" height="40" rx="2.5" width="5" x="36.8333" />
      <rect fill="url(#paint7_linear_235_9215)" height="40" rx="2.5" width="5" x="42.8333" />
      <rect fill="url(#paint8_linear_235_9215)" height="40" rx="2.5" width="5" x="48.8333" />
      <rect
        fill="url(#paint9_linear_235_9215)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="54.8333"
        y="38"
      />
      <rect
        fill="url(#paint10_linear_235_9215)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="60.8333"
        y="38"
      />
      <rect
        fill="url(#paint11_linear_235_9215)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="66.8333"
        y="38"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9215"
          x1="3.33331"
          x2="3.33331"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_9215"
          x1="9.33331"
          x2="9.33331"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_235_9215"
          x1="15.3333"
          x2="15.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_235_9215"
          x1="21.3333"
          x2="21.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint4_linear_235_9215"
          x1="27.3333"
          x2="27.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_235_9215"
          x1="33.3333"
          x2="33.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_235_9215"
          x1="39.3333"
          x2="39.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint7_linear_235_9215"
          x1="45.3333"
          x2="45.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint8_linear_235_9215"
          x1="51.3333"
          x2="51.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint9_linear_235_9215"
          x1="57.3333"
          x2="57.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint10_linear_235_9215"
          x1="63.3333"
          x2="63.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint11_linear_235_9215"
          x1="69.3333"
          x2="69.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function TargetRangeStandardSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 72 40"
      width="72"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        fill="url(#paint0_linear_235_9233)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="0.5"
        y="38"
      />
      <rect
        fill="url(#paint1_linear_235_9233)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="6.5"
        y="38"
      />
      <rect fill="url(#paint2_linear_235_9233)" height="40" rx="2.5" width="5" x="12.5" />
      <rect fill="url(#paint3_linear_235_9233)" height="40" rx="2.5" width="5" x="18.5" />
      <rect fill="url(#paint4_linear_235_9233)" height="40" rx="2.5" width="5" x="24.5" />
      <rect fill="url(#paint5_linear_235_9233)" height="40" rx="2.5" width="5" x="30.5" />
      <rect fill="url(#paint6_linear_235_9233)" height="40" rx="2.5" width="5" x="36.5" />
      <rect fill="url(#paint7_linear_235_9233)" height="40" rx="2.5" width="5" x="42.5" />
      <rect fill="url(#paint8_linear_235_9233)" height="40" rx="2.5" width="5" x="48.5" />
      <rect fill="url(#paint9_linear_235_9233)" height="40" rx="2.5" width="5" x="54.5" />
      <rect
        fill="url(#paint10_linear_235_9233)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="60.5"
        y="38"
      />
      <rect
        fill="url(#paint11_linear_235_9233)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="66.5"
        y="38"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9233"
          x1="3"
          x2="3"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_9233"
          x1="9"
          x2="9"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_235_9233"
          x1="15"
          x2="15"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_235_9233"
          x1="21"
          x2="21"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint4_linear_235_9233"
          x1="27"
          x2="27"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_235_9233"
          x1="33"
          x2="33"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_235_9233"
          x1="39"
          x2="39"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint7_linear_235_9233"
          x1="45"
          x2="45"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint8_linear_235_9233"
          x1="51"
          x2="51"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint9_linear_235_9233"
          x1="57"
          x2="57"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint10_linear_235_9233"
          x1="63"
          x2="63"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint11_linear_235_9233"
          x1="69"
          x2="69"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function TargetRangeWideSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 66 40"
      width="66"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        fill="url(#paint0_linear_235_9250)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="0.166626"
        y="38"
      />
      <rect fill="url(#paint1_linear_235_9250)" height="40" rx="2.5" width="5" x="6.16663" />
      <rect fill="url(#paint2_linear_235_9250)" height="40" rx="2.5" width="5" x="12.1666" />
      <rect fill="url(#paint3_linear_235_9250)" height="40" rx="2.5" width="5" x="18.1666" />
      <rect fill="url(#paint4_linear_235_9250)" height="40" rx="2.5" width="5" x="24.1666" />
      <rect fill="url(#paint5_linear_235_9250)" height="40" rx="2.5" width="5" x="30.1666" />
      <rect fill="url(#paint6_linear_235_9250)" height="40" rx="2.5" width="5" x="36.1666" />
      <rect fill="url(#paint7_linear_235_9250)" height="40" rx="2.5" width="5" x="42.1666" />
      <rect fill="url(#paint8_linear_235_9250)" height="40" rx="2.5" width="5" x="48.1666" />
      <rect fill="url(#paint9_linear_235_9250)" height="40" rx="2.5" width="5" x="54.1666" />
      <rect
        fill="url(#paint10_linear_235_9250)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="60.1666"
        y="38"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9250"
          x1="2.66663"
          x2="2.66663"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_9250"
          x1="8.66663"
          x2="8.66663"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_235_9250"
          x1="14.6666"
          x2="14.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_235_9250"
          x1="20.6666"
          x2="20.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint4_linear_235_9250"
          x1="26.6666"
          x2="26.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_235_9250"
          x1="32.6666"
          x2="32.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_235_9250"
          x1="38.6666"
          x2="38.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint7_linear_235_9250"
          x1="44.6666"
          x2="44.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint8_linear_235_9250"
          x1="50.6666"
          x2="50.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint9_linear_235_9250"
          x1="56.6666"
          x2="56.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint10_linear_235_9250"
          x1="62.6666"
          x2="62.6666"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function MarginBufferNarrowSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 84 40"
      width="84"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        fill="url(#paint0_linear_235_9279)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="0.833313"
        y="38"
      />
      <rect
        fill="url(#paint1_linear_235_9279)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="6.83331"
        y="38"
      />
      <rect
        fill="url(#paint2_linear_235_9279)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="12.8333"
        y="38"
      />
      <rect fill="url(#paint3_linear_235_9279)" height="40" rx="2.5" width="5" x="18.8333" />
      <rect fill="url(#paint4_linear_235_9279)" height="40" rx="2.5" width="5" x="24.8333" />
      <rect fill="url(#paint5_linear_235_9279)" height="40" rx="2.5" width="5" x="30.8333" />
      <rect fill="url(#paint6_linear_235_9279)" height="40" rx="2.5" width="5" x="36.8333" />
      <rect fill="url(#paint7_linear_235_9279)" height="40" rx="2.5" width="5" x="42.8333" />
      <rect fill="url(#paint8_linear_235_9279)" height="40" rx="2.5" width="5" x="48.8333" />
      <rect fill="url(#paint9_linear_235_9279)" height="40" rx="2.5" width="5" x="54.8333" />
      <rect fill="url(#paint10_linear_235_9279)" height="40" rx="2.5" width="5" x="60.8333" />
      <rect
        fill="url(#paint11_linear_235_9279)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="66.8333"
        y="38"
      />
      <rect
        fill="url(#paint12_linear_235_9279)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="72.8333"
        y="38"
      />
      <rect
        fill="url(#paint13_linear_235_9279)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="78.8333"
        y="38"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9279"
          x1="3.33331"
          x2="3.33331"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_9279"
          x1="9.33331"
          x2="9.33331"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_235_9279"
          x1="15.3333"
          x2="15.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_235_9279"
          x1="21.3333"
          x2="21.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint4_linear_235_9279"
          x1="27.3333"
          x2="27.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_235_9279"
          x1="33.3333"
          x2="33.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_235_9279"
          x1="39.3333"
          x2="39.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint7_linear_235_9279"
          x1="45.3333"
          x2="45.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint8_linear_235_9279"
          x1="51.3333"
          x2="51.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint9_linear_235_9279"
          x1="57.3333"
          x2="57.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint10_linear_235_9279"
          x1="63.3333"
          x2="63.3333"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint11_linear_235_9279"
          x1="69.3333"
          x2="69.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint12_linear_235_9279"
          x1="75.3333"
          x2="75.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint13_linear_235_9279"
          x1="81.3333"
          x2="81.3333"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function MarginBufferStandardSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 84 40"
      width="84"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        fill="url(#paint0_linear_235_9298)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="0.5"
        y="38"
      />
      <rect
        fill="url(#paint1_linear_235_9298)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="6.5"
        y="38"
      />
      <rect fill="url(#paint2_linear_235_9298)" height="40" rx="2.5" width="5" x="12.5" />
      <rect fill="url(#paint3_linear_235_9298)" height="40" rx="2.5" width="5" x="18.5" />
      <rect fill="url(#paint4_linear_235_9298)" height="40" rx="2.5" width="5" x="24.5" />
      <rect fill="url(#paint5_linear_235_9298)" height="40" rx="2.5" width="5" x="30.5" />
      <rect fill="url(#paint6_linear_235_9298)" height="40" rx="2.5" width="5" x="36.5" />
      <rect fill="url(#paint7_linear_235_9298)" height="40" rx="2.5" width="5" x="42.5" />
      <rect fill="url(#paint8_linear_235_9298)" height="40" rx="2.5" width="5" x="48.5" />
      <rect fill="url(#paint9_linear_235_9298)" height="40" rx="2.5" width="5" x="54.5" />
      <rect fill="url(#paint10_linear_235_9298)" height="40" rx="2.5" width="5" x="60.5" />
      <rect fill="url(#paint11_linear_235_9298)" height="40" rx="2.5" width="5" x="66.5" />
      <rect
        fill="url(#paint12_linear_235_9298)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="72.5"
        y="38"
      />
      <rect
        fill="url(#paint13_linear_235_9298)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="78.5"
        y="38"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9298"
          x1="3"
          x2="3"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_9298"
          x1="9"
          x2="9"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_235_9298"
          x1="15"
          x2="15"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_235_9298"
          x1="21"
          x2="21"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint4_linear_235_9298"
          x1="27"
          x2="27"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_235_9298"
          x1="33"
          x2="33"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_235_9298"
          x1="39"
          x2="39"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint7_linear_235_9298"
          x1="45"
          x2="45"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint8_linear_235_9298"
          x1="51"
          x2="51"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint9_linear_235_9298"
          x1="57"
          x2="57"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint10_linear_235_9298"
          x1="63"
          x2="63"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint11_linear_235_9298"
          x1="69"
          x2="69"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint12_linear_235_9298"
          x1="75"
          x2="75"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint13_linear_235_9298"
          x1="81"
          x2="81"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function MarginBufferWideSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="40"
      viewBox="0 0 96 40"
      width="96"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        fill="url(#paint0_linear_235_9317)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="0.166626"
        y="38"
      />
      <rect
        fill="url(#paint1_linear_235_9317)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="6.16663"
        y="38"
      />
      <rect fill="url(#paint2_linear_235_9317)" height="40" rx="2.5" width="5" x="12.1666" />
      <rect fill="url(#paint3_linear_235_9317)" height="40" rx="2.5" width="5" x="18.1666" />
      <rect fill="url(#paint4_linear_235_9317)" height="40" rx="2.5" width="5" x="24.1666" />
      <rect fill="url(#paint5_linear_235_9317)" height="40" rx="2.5" width="5" x="30.1666" />
      <rect fill="url(#paint6_linear_235_9317)" height="40" rx="2.5" width="5" x="36.1666" />
      <rect fill="url(#paint7_linear_235_9317)" height="40" rx="2.5" width="5" x="42.1666" />
      <rect fill="url(#paint8_linear_235_9317)" height="40" rx="2.5" width="5" x="48.1666" />
      <rect fill="url(#paint9_linear_235_9317)" height="40" rx="2.5" width="5" x="54.1666" />
      <rect fill="url(#paint10_linear_235_9317)" height="40" rx="2.5" width="5" x="60.1666" />
      <rect fill="url(#paint11_linear_235_9317)" height="40" rx="2.5" width="5" x="66.1666" />
      <rect fill="url(#paint12_linear_235_9317)" height="40" rx="2.5" width="5" x="72.1666" />
      <rect fill="url(#paint13_linear_235_9317)" height="40" rx="2.5" width="5" x="78.1666" />
      <rect
        fill="url(#paint14_linear_235_9317)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="84.1666"
        y="38"
      />
      <rect
        fill="url(#paint15_linear_235_9317)"
        height="2"
        opacity="0.5"
        rx="1"
        width="5"
        x="90.1666"
        y="38"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_9317"
          x1="2.66663"
          x2="2.66663"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_9317"
          x1="8.66663"
          x2="8.66663"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint2_linear_235_9317"
          x1="14.6666"
          x2="14.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint3_linear_235_9317"
          x1="20.6666"
          x2="20.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint4_linear_235_9317"
          x1="26.6666"
          x2="26.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint5_linear_235_9317"
          x1="32.6666"
          x2="32.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint6_linear_235_9317"
          x1="38.6666"
          x2="38.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint7_linear_235_9317"
          x1="44.6666"
          x2="44.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint8_linear_235_9317"
          x1="50.6666"
          x2="50.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint9_linear_235_9317"
          x1="56.6666"
          x2="56.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint10_linear_235_9317"
          x1="62.6666"
          x2="62.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint11_linear_235_9317"
          x1="68.6666"
          x2="68.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint12_linear_235_9317"
          x1="74.6666"
          x2="74.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint13_linear_235_9317"
          x1="80.6666"
          x2="80.6666"
          y1="0"
          y2="40"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint14_linear_235_9317"
          x1="86.6666"
          x2="86.6666"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint15_linear_235_9317"
          x1="92.6666"
          x2="92.6666"
          y1="38"
          y2="40"
        >
          <stop stopColor="#A0AEC0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#A0AEC0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PriceAdjustmentRateSlowSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="44"
      viewBox="0 0 52 44"
      width="52"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.76464 42C6.48771 38.723 4.2561 34.5479 3.35201 30.0027C2.44793 25.4574 2.91197 20.7461 4.68545 16.4646C6.45894 12.1831 9.46221 8.52358 13.3155 5.9489C17.1688 3.37423 21.699 2 26.3333 2C30.9676 2 35.4979 3.37423 39.3511 5.9489C43.2044 8.52358 46.2077 12.1831 47.9812 16.4646C49.7547 20.7461 50.2187 25.4574 49.3146 30.0027C48.4105 34.5479 46.1789 38.723 42.902 42"
        stroke="url(#paint0_linear_235_11061)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M16.7473 16.0172L26.3333 25.4312"
        stroke="url(#paint1_linear_235_11061)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_11061"
          x1="26.3333"
          x2="26.3333"
          y1="2"
          y2="42"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_11061"
          x1="21.5403"
          x2="21.5403"
          y1="16.0172"
          y2="25.4312"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PriceAdjustmentRateStandardSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="44"
      viewBox="0 0 52 44"
      width="52"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.43132 42C6.1544 38.723 3.92279 34.5479 3.0187 30.0027C2.11461 25.4574 2.57865 20.7461 4.35214 16.4646C6.12562 12.1831 9.1289 8.52358 12.9822 5.9489C16.8355 3.37423 21.3657 2 26 2C30.6343 2 35.1645 3.37423 39.0178 5.9489C42.8711 8.52358 45.8744 12.1831 47.6479 16.4646C49.4214 20.7461 49.8854 25.4574 48.9813 30.0027C48.0772 34.5479 45.8456 38.723 42.5687 42"
        opacity="0.5"
        stroke="url(#paint0_linear_235_11049)"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M26 11.2799V25.431"
        stroke="url(#paint1_linear_235_11049)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_11049"
          x1="26"
          x2="26"
          y1="2"
          y2="42"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_11049"
          x1="26.5"
          x2="26.5"
          y1="11.2799"
          y2="25.431"
        >
          <stop stopColor="#63F2BE" />
          <stop offset="1" stopColor="#398C6E" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PriceAdjustmentRateFastSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="44"
      viewBox="0 0 52 44"
      width="52"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.09795 42C5.82102 38.723 3.58941 34.5479 2.68533 30.0027C1.78124 25.4574 2.24528 20.7461 4.01876 16.4646C5.79225 12.1831 8.79552 8.52358 12.6488 5.9489C16.5021 3.37423 21.0323 2 25.6666 2C30.3009 2 34.8312 3.37423 38.6845 5.9489C42.5377 8.52358 45.541 12.1831 47.3145 16.4646C49.088 20.7461 49.552 25.4574 48.6479 30.0027C47.7439 34.5479 45.5123 38.723 42.2353 42"
        stroke="url(#paint0_linear_235_11057)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M36.0806 15.0172L25.6666 25.4312"
        stroke="url(#paint1_linear_235_11057)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_235_11057"
          x1="25.6666"
          x2="25.6666"
          y1="2"
          y2="42"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_235_11057"
          x1="30.8736"
          x2="30.8736"
          y1="15.0172"
          y2="25.4312"
        >
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#976F45" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
}
