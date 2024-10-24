import { useRive } from '@rive-app/react-canvas'

export default function RiveAnimationTest() {
  const { rive, RiveComponent } = useRive({
    src: '/v3.riv',
    stateMachines: 'StateMachineTest',
    autoplay: false,
  })

  return (
    <RiveComponent
      onMouseEnter={() => rive && rive.play()}
      onMouseLeave={() => rive && rive.pause()}
    />
  )
}
