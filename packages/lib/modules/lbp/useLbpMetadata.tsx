import { useMutation } from '@apollo/client'
import { CreateLbpDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLbpForm } from './LbpFormProvider'
import { normalizeUrl } from '@repo/lib/shared/utils/urls'
import { normalizeHandle } from '@repo/lib/shared/utils/links'

export function useLbpMetadata() {
  const [createLbp, { error, reset }] = useMutation(CreateLbpDocument)
  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )
  const [isMetadataSaved, setIsMetadataSaved] = useLocalStorage<boolean>(
    LS_KEYS.LbpConfig.IsMetadataSaved,
    false
  )

  const { saleStructureForm, projectInfoForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { name, description, websiteUrl, tokenIconUrl, telegramHandle, xHandle, discordUrl } =
    projectInfoForm.getValues()

  const saveMetadata = async () => {
    const { data } = await createLbp({
      variables: {
        input: {
          poolContract: {
            address: poolAddress as `0x${string}`,
            chain: selectedChain,
          },
          metadata: {
            lbpName: name,
            description,
            website: normalizeUrl(websiteUrl, { useImageProxy: false }),
            tokenLogo: normalizeUrl(tokenIconUrl),
            telegram: telegramHandle ? normalizeHandle(telegramHandle) : undefined,
            discord: discordUrl ? normalizeUrl(discordUrl, { useImageProxy: false }) : undefined,
            x: xHandle ? normalizeHandle(xHandle) : undefined,
          },
        },
      },
    })
    if (data?.createLBP) setIsMetadataSaved(true)
  }

  return {
    saveMetadata,
    error,
    isMetadataSaved,
    reset,
  }
}
