import { useLbpForm } from '@repo/lib/modules/lbp/LbpFormProvider'
import { useMutation } from '@apollo/client'
import { CreateLbpDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { useLocalStorage } from 'usehooks-ts'
import { LS_KEYS } from '@repo/lib/modules/local-storage/local-storage.constants'

export function useSaveMetadata() {
  const [createLbp, { error, loading, data }] = useMutation(CreateLbpDocument)
  const [poolAddress] = useLocalStorage<`0x${string}` | undefined>(
    LS_KEYS.LbpConfig.PoolAddress,
    undefined
  )
  const [, setIsMetadataSaved] = useLocalStorage<boolean>(LS_KEYS.LbpConfig.IsMetadataSaved, false)
  const { saleStructureForm } = useLbpForm()
  const { selectedChain } = saleStructureForm.getValues()
  const { projectInfoForm } = useLbpForm()
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
    if (data?.createLBP) {
      setIsMetadataSaved(true)
    } else {
      setIsMetadataSaved(false)
    }
  }

  const { message: errorTitle, graphQLErrors } = error ?? {}
  const errorMessage =
    graphQLErrors &&
    graphQLErrors
      .map(error =>
        (error.extensions?.errors as Array<{ message: string }>)?.map(err => err.message)
      )
      .flat()
      .join(', ')

  return {
    saveMetadata,
    errorMessage,
    errorTitle,
    loading,
    data,
  }
}
