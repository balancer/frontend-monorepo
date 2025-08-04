import { useMutation } from '@apollo/client'
import { CreateLbpDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLbpForm } from './LbpFormProvider'
import { normalizeUrl } from '@repo/lib/shared/utils/urls'

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
            website: normalizeUrl(websiteUrl),
            tokenLogo: normalizeUrl(tokenIconUrl),
            telegram: telegramHandle,
            discord: discordUrl ? normalizeUrl(discordUrl) : undefined,
            x: xHandle,
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
