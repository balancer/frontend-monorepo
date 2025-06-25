import { useMutation } from '@apollo/client'
import { CreateLbpDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'
import { useLbpForm } from './LbpFormProvider'

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
            website: websiteUrl,
            tokenLogo: tokenIconUrl,
            telegram: telegramHandle,
            discord: discordUrl,
            x: xHandle,
          },
        },
      },
    })
    if (data?.createLBP) setIsMetadataSaved(true)
  }

  const { message: title, graphQLErrors } = error ?? {}
  const message =
    graphQLErrors &&
    graphQLErrors
      .map(error =>
        (error.extensions?.errors as Array<{ message: string }>)?.map(err => err.message)
      )
      .flat()
      .join(', ')

  return {
    saveMetadata,
    error: title && message ? `${title}: ${message}` : undefined,
    isMetadataSaved,
    reset,
  }
}
