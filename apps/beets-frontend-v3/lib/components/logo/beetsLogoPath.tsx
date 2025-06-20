export function drawBeetsLogo(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const scale = Math.min(width, height) / 500 // Scale based on original SVG viewBox of 500x500

  ctx.save()
  ctx.scale(scale, scale)

  // Draw the main white shape (cls-1)
  ctx.fillStyle = 'white'
  ctx.beginPath()
  const path1 = new Path2D(
    'M250,20h0C122.97,20,20,122.97,20,250h0v230h460v-230h0c0-127.03-102.97-230-230-230Z'
  )
  ctx.fill(path1)

  // Draw the black rectangles (cls-4) - right side
  ctx.fillStyle = '#1a1a1a'
  ctx.save()
  ctx.translate(336.25, 380.54) // Center point after transform
  ctx.rotate(Math.PI / 2) // 90 degree rotation
  // Draw rounded rectangle (115x115 with 57.5 radius)
  ctx.beginPath()
  ctx.roundRect(-57.5, -57.5, 115, 115, 57.5)
  ctx.fill()
  ctx.restore()

  // Draw the black rectangles (cls-4) - left side
  ctx.fillStyle = '#1a1a1a'
  ctx.save()
  ctx.translate(163.75, 380.54) // Center point after transform
  ctx.rotate(Math.PI / 2) // 90 degree rotation
  // Draw rounded rectangle (115x115 with 57.5 radius)
  ctx.beginPath()
  ctx.roundRect(-57.5, -57.5, 115, 115, 57.5)
  ctx.fill()
  ctx.restore()

  // Draw the green rectangle (cls-2)
  ctx.fillStyle = '#05d690'
  ctx.save()
  ctx.translate(336.25, 380.54) // Center point after transform
  ctx.rotate(Math.PI / 2) // 90 degree rotation
  // Draw rounded rectangle (35.94x35.94 with 17.97 radius)
  ctx.beginPath()
  ctx.roundRect(-17.97, -17.97, 35.94, 35.94, 17.97)
  ctx.fill()
  ctx.restore()

  // Draw the red rectangle (cls-3)
  ctx.fillStyle = 'red'
  ctx.save()
  ctx.translate(163.75, 380.54) // Center point after transform
  ctx.rotate(Math.PI / 2) // 90 degree rotation
  // Draw rounded rectangle (35.94x35.94 with 17.97 radius)
  ctx.beginPath()
  ctx.roundRect(-17.97, -17.97, 35.94, 35.94, 17.97)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}
