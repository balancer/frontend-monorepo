import useSound from 'use-sound'
import { StepType } from './lib'
import { usePathname } from 'next/navigation'
import { useUserSettings } from '../../user/settings/UserSettingsProvider'

export function useTxSound() {
  const pathname = usePathname()
  const { allowSounds } = useUserSettings()

  const isCowTransaction = pathname.includes('/cow/')
  const successSoundSrc = isCowTransaction ? '/sounds/successMoo.mp3' : '/sounds/gong.mp3'
  const [playSuccessSound] = useSound(successSoundSrc)

  const removeSoundSrc = isCowTransaction ? '/sounds/errorMoo.mp3' : '/sounds/gong.mp3'
  const [playRemoveSound] = useSound(removeSoundSrc)

  const playTxSound = (stepType: StepType) => {
    if (allowSounds === 'no') return
    stepType === 'removeLiquidity' ? playRemoveSound() : playSuccessSound()
  }

  return { playTxSound }
}
