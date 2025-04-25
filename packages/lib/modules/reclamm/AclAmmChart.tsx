/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { calculateLowerMargin, calculateUpperMargin } from './aclAmmMath'

interface AclAmmChartProps {
  realTimeBalanceA: number
  realTimeBalanceB: number
  margin: number
  realTimeVirtualBalances: {
    virtualBalanceA: number
    virtualBalanceB: number
  }
  realTimeInvariant: number
  initialInvariant: number
  currentBalanceA: number
  currentBalanceB: number
  currentVirtualBalances: {
    virtualBalanceA: number
    virtualBalanceB: number
  }
  currentInvariant: number
}

const NUM_POINTS = 100
const MARGIN = 0.1

export function AclAmmChart({
  realTimeBalanceA,
  realTimeBalanceB,
  margin,
  realTimeVirtualBalances,
  realTimeInvariant,
  initialInvariant,
  currentBalanceA,
  currentBalanceB,
  currentVirtualBalances,
  currentInvariant,
}: AclAmmChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const realTimeChartData = useMemo(() => {
    const xForPointB = realTimeInvariant / realTimeVirtualBalances.virtualBalanceB

    // Create regular curve points
    const curvePoints = Array.from({ length: NUM_POINTS }, (_, i) => {
      const x =
        (1 - MARGIN) * realTimeVirtualBalances.virtualBalanceA +
        (i * ((1 + MARGIN) * xForPointB - (1 - MARGIN) * realTimeVirtualBalances.virtualBalanceA)) /
          NUM_POINTS
      const y = realTimeInvariant / x

      return { x, y }
    })

    return curvePoints
  }, [realTimeVirtualBalances, realTimeInvariant])

  const chartInitialData = useMemo(() => {
    const xForPointB = initialInvariant / realTimeVirtualBalances.virtualBalanceB

    // Create regular curve points
    const curvePoints = Array.from({ length: NUM_POINTS }, (_, i) => {
      const x =
        (1 - MARGIN) * realTimeVirtualBalances.virtualBalanceA +
        (i * ((1 + MARGIN) * xForPointB - (1 - MARGIN) * realTimeVirtualBalances.virtualBalanceA)) /
          100
      const y = initialInvariant / x

      return { x, y }
    })

    return curvePoints
  }, [initialInvariant, realTimeVirtualBalances])

  const specialPoints = useMemo(() => {
    // Real-time points
    const realTimeMaxPrice = {
      x: realTimeVirtualBalances.virtualBalanceA,
      y: realTimeInvariant / realTimeVirtualBalances.virtualBalanceA,
    }

    const xForPointB = realTimeInvariant / realTimeVirtualBalances.virtualBalanceB
    const realTimeMinPrice = {
      x: xForPointB,
      y: realTimeVirtualBalances.virtualBalanceB,
    }

    const realTimeRealMargin = calculateLowerMargin({
      margin,
      invariant: realTimeInvariant,
      virtualBalanceA: realTimeVirtualBalances.virtualBalanceA,
      virtualBalanceB: realTimeVirtualBalances.virtualBalanceB,
    })

    const realTimeUpperMargin = calculateUpperMargin({
      margin,
      invariant: realTimeInvariant,
      virtualBalanceA: realTimeVirtualBalances.virtualBalanceA,
      virtualBalanceB: realTimeVirtualBalances.virtualBalanceB,
    })

    const realTimeLowerMarginPoint = {
      x: realTimeRealMargin,
      y: realTimeInvariant / realTimeRealMargin,
      pointType: 'margin',
    }

    const realTimeUpperMarginPoint = {
      x: realTimeUpperMargin,
      y: realTimeInvariant / realTimeUpperMargin,
      pointType: 'margin',
    }

    const realTimeBalances = {
      x: realTimeBalanceA + realTimeVirtualBalances.virtualBalanceA,
      y: realTimeBalanceB + realTimeVirtualBalances.virtualBalanceB,
      pointType: 'current',
    }

    // Current points
    const currentMaxPrice = {
      x: currentVirtualBalances.virtualBalanceA,
      y: currentInvariant / currentVirtualBalances.virtualBalanceA,
    }

    const currentXForPointB = currentInvariant / currentVirtualBalances.virtualBalanceB
    const currentMinPrice = {
      x: currentXForPointB,
      y: currentVirtualBalances.virtualBalanceB,
    }

    const currentLowerMargin = calculateLowerMargin({
      margin,
      invariant: currentInvariant,
      virtualBalanceA: currentVirtualBalances.virtualBalanceA,
      virtualBalanceB: currentVirtualBalances.virtualBalanceB,
    })

    const currentUpperMargin = calculateUpperMargin({
      margin,
      invariant: currentInvariant,
      virtualBalanceA: currentVirtualBalances.virtualBalanceA,
      virtualBalanceB: currentVirtualBalances.virtualBalanceB,
    })

    const currentLowerMarginPoint = {
      x: currentLowerMargin,
      y: currentInvariant / currentLowerMargin,
      pointType: 'margin',
    }

    const currentUpperMarginPoint = {
      x: currentUpperMargin,
      y: currentInvariant / currentUpperMargin,
      pointType: 'margin',
    }

    const currentBalances = {
      x: currentBalanceA + currentVirtualBalances.virtualBalanceA,
      y: currentBalanceB + currentVirtualBalances.virtualBalanceB,
      pointType: 'current',
    }

    return [
      realTimeMaxPrice,
      realTimeMinPrice,
      currentMaxPrice,
      currentMinPrice,
      realTimeBalances,
      currentBalances,
      realTimeLowerMarginPoint,
      realTimeUpperMarginPoint,
      currentLowerMarginPoint,
      currentUpperMarginPoint,
    ]
  }, [
    realTimeBalanceA,
    realTimeBalanceB,
    currentBalanceA,
    currentBalanceB,
    margin,
    realTimeVirtualBalances,
    currentVirtualBalances,
    realTimeInvariant,
    currentInvariant,
  ])

  const currentChartData = useMemo(() => {
    const xForPointB = currentInvariant / currentVirtualBalances.virtualBalanceB

    // Create regular curve points
    const curvePoints = Array.from({ length: 100 }, (_, i) => {
      const x =
        0.7 * currentVirtualBalances.virtualBalanceA +
        (i * (1.3 * xForPointB - 0.7 * currentVirtualBalances.virtualBalanceA)) / 100
      const y = currentInvariant / x

      return { x, y }
    })

    return curvePoints
  }, [currentVirtualBalances, currentInvariant])

  useEffect(() => {
    if (!svgRef.current || !realTimeChartData.length) return

    const renderChart = () => {
      // Clear previous chart
      d3.select(svgRef.current).selectAll('*').remove()

      // Set up dimensions
      const svgElement = svgRef.current
      const containerWidth = svgElement?.parentElement?.clientWidth ?? 800
      const width = containerWidth
      const height = 600
      const margin = { top: 40, right: 40, bottom: 60, left: 60 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      // Create scales
      const xScale = d3
        .scaleLinear()
        .domain([d3.min(realTimeChartData, d => d.x)!, d3.max(realTimeChartData, d => d.x)!])
        .range([0, innerWidth])

      const yScale = d3
        .scaleLinear()
        .domain([d3.min(realTimeChartData, d => d.y)!, d3.max(realTimeChartData, d => d.y)!])
        .range([innerHeight, 0])

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Add grid
      svg
        .append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(
          d3
            .axisBottom(xScale)
            .tickSize(innerHeight)
            .tickFormat(() => '')
        )
        .call(g => g.select('.domain').remove())

      svg
        .append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .call(g => g.select('.domain').remove())

      // Add axes
      svg.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(xScale))

      svg.append('g').call(d3.axisLeft(yScale))

      // Add reference lines
      svg
        .append('line')
        .attr('x1', xScale(realTimeVirtualBalances.virtualBalanceA))
        .attr('x2', xScale(realTimeVirtualBalances.virtualBalanceA))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#BBBBBB')
        .attr('stroke-width', 2)

      svg
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(realTimeVirtualBalances.virtualBalanceB))
        .attr('y2', yScale(realTimeVirtualBalances.virtualBalanceB))
        .attr('stroke', '#BBBBBB')
        .attr('stroke-width', 2)

      // Add initial price curve (before the regular curve)
      const initialLine = d3
        .line<any>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))

      svg
        .append('path')
        .datum(chartInitialData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', initialLine)

      // Add current price curve
      const currentLine = d3
        .line<any>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))

      svg
        .append('path')
        .datum(currentChartData)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('d', currentLine)

      // Add curve
      const line = d3
        .line<any>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))

      svg
        .append('path')
        .datum(realTimeChartData)
        .attr('fill', 'none')
        .attr('stroke', '#4CAF50')
        .attr('stroke-width', 2)
        .attr('d', line)

      // Add special points (min/max prices) for both real-time and current
      svg
        .selectAll('.point-price')
        .data(specialPoints.slice(0, 4)) // Real-time and current min/max prices
        .enter()
        .append('circle')
        .attr('class', 'point-price')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', 'red')

      // Add tooltip div
      const tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '8px')
        .style('pointer-events', 'none')
        .style('font-size', '12px')

      // Modify the balance points section
      svg
        .selectAll('.point-balance')
        .data(specialPoints.slice(4, 6)) // Real-time and current balances
        .enter()
        .append('circle')
        .attr('class', 'point-balance')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', 'green')
        .on('mouseover', event => {
          tooltip
            .style('opacity', 1)
            .html(
              `Real Balance A: ${realTimeBalanceA.toFixed(
                2
              )}<br/>Real Balance B: ${realTimeBalanceB.toFixed(2)}`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px')
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0)
        })
        .on('mousemove', event => {
          tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px')
        })

      // Add margin points for both real-time and current
      svg
        .selectAll('.point-margin')
        .data(specialPoints.slice(6)) // Real-time and current margins
        .enter()
        .append('circle')
        .attr('class', 'point-margin')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', 'blue')

      // Add axis labels
      svg
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .text('Total Balance A')

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .text('Total Balance B')

      // Add legend
      const legendData = [
        { color: '#4CAF50', text: 'Real Time Invariant', type: 'line' },
        { color: 'blue', text: 'Current Invariant', type: 'line' },
        { color: 'red', text: 'Initial Invariant', type: 'dashed-line' },
        { color: 'green', text: 'Balances', type: 'circle' },
        { color: 'red', text: 'Min/Max Prices', type: 'circle' },
        { color: 'blue', text: 'Margins', type: 'circle' },
      ]

      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth - 200}, 20)`)

      // Add white background to legend
      const legendPadding = 10
      const legendWidth = 180 // Adjust based on your text length
      const legendHeight = legendData.length * 20 + legendPadding * 2

      legend
        .append('rect')
        .attr('x', -2 * legendPadding)
        .attr('y', -2 * legendPadding)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)

      // Add legend items
      const legendItems = legend
        .selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`)

      // Add symbols
      legendItems.each(function (d) {
        const item = d3.select(this)
        if (d.type === 'circle') {
          item.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 5).attr('fill', d.color)
        } else if (d.type === 'line' || d.type === 'dashed-line') {
          item
            .append('line')
            .attr('x1', -10)
            .attr('x2', 10)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', d.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', d.type === 'dashed-line' ? '5,5' : 'none')
        }
      })

      // Add text labels
      legendItems
        .append('text')
        .attr('x', 15)
        .attr('y', 4)
        .text(d => d.text)
        .style('font-size', '12px')
    }

    renderChart()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      renderChart()
    })

    if (svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement)
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect()
      d3.select('body').selectAll('.tooltip').remove()
    }
  }, [
    realTimeChartData,
    specialPoints,
    realTimeVirtualBalances,
    realTimeBalanceA,
    realTimeBalanceB,
    chartInitialData,
    currentChartData,
  ])

  return <svg ref={svgRef} />
}
