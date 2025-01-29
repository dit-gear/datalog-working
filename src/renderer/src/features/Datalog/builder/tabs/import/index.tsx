import { useState } from 'react'
import { Button } from '@components/ui/button'
import { mergeDirtyValues } from '../../utils/merge-clips'
import { CopyType, CustomType, OcfClipType, ProxyType, SoundClipType } from '@shared/datalogTypes'
import { useFormContext } from 'react-hook-form'
import { CopiesList } from './CopiesList'
import { X } from 'lucide-react'
import { Section } from './section'
import { ProjectRootType } from '@shared/projectTypes'
import LoadingDialog from '@components/LoadingDialog'

interface ImportProps {
  project: ProjectRootType
}

export const Import = ({ project }: ImportProps) => {
  const [loadingOpen, setLoadingOpen] = useState<boolean>(false)
  const hasCustomFields = Boolean(project?.custom_fields)
  const { getValues, setValue, resetField, formState } = useFormContext()

  function updateClips(fieldPath: 'ocf.clips', newClips: OcfClipType[]): void
  function updateClips(fieldPath: 'sound.clips', newClips: SoundClipType[]): void
  function updateClips(fieldPath: 'proxy.clips', newClips: ProxyType[]): void
  function updateClips(fieldPath: 'custom', newClips: CustomType[]): void
  function updateClips<T>(fieldPath: string, newClips: T[]) {
    const dirtyFields = formState.dirtyFields[fieldPath]?.clips || formState.dirtyFields[fieldPath]
    const currentClips = getValues(fieldPath)
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)

    resetField(fieldPath, { defaultValue: mergedClips, keepDirty: true })
    setValue(fieldPath, mergedClips)
  }

  const handleAddClips = async (type: 'ocf' | 'sound' | 'proxy' | 'custom'): Promise<void> => {
    try {
      const currentClips = getValues(`${type === 'sound' ? 'sound' : 'ocf'}.clips`)
      setLoadingOpen(true)
      const res = await window.mainApi.getClips(type, currentClips)
      if (res.success) {
        const { ocf, sound, proxy, custom } = res.clips
        if (!ocf && !sound && !proxy && !custom) {
          throw new Error('No valid clips found')
        }
        ocf && updateClips('ocf.clips', ocf)
        sound && updateClips('sound.clips', sound)
        proxy && updateClips('proxy.clips', proxy)
        custom && updateClips('custom', custom)
      } else {
        if (res.cancelled) return
        throw new Error(res.error)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingOpen(false)
    }
  }

  const handleRemoveClips = async (copy: CopyType, type: 'ocf' | 'sound'): Promise<void> => {
    try {
      const currentClips = getValues(`${type}.clips`)
      const res = await window.mainApi.removeClips(copy.volumes, type, currentClips)
      if (res.success) {
        const { ocf, sound } = res.clips
        if (!ocf && !sound) {
          throw new Error('No valid clips found: both ocf and sound are missing.')
        }
        ocf && updateClips('ocf.clips', ocf)
        sound && updateClips('sound.clips', sound)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }
  /** Used for removing clips that is only stored in the renderer */
  const handleRemoveClipsLocal = async (type: 'proxy' | 'custom'): Promise<void> => {
    type === 'proxy' ? updateClips('proxy.clips', []) : updateClips('custom', [])
  }

  return (
    <div className="space-y-16">
      <Section label="Original Camera Files" type="ocf" handleAddClips={handleAddClips}>
        <CopiesList type="ocf" handleRemoveCopy={handleRemoveClips} />
      </Section>
      <Section label="Sound" type="sound" handleAddClips={handleAddClips}>
        <CopiesList type="sound" handleRemoveCopy={handleRemoveClips} />
      </Section>
      <Section label="Proxies" type="proxy" handleAddClips={handleAddClips}>
        <Button size="sm" onClick={() => handleRemoveClipsLocal('proxy')} variant="destructive">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </Section>
      <Section
        label="Custom Metadata"
        type="custom"
        handleAddClips={handleAddClips}
        disabled={!hasCustomFields}
      >
        <Button size="sm" onClick={() => handleRemoveClipsLocal('custom')} variant="destructive">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </Section>
      <LoadingDialog open={loadingOpen} />
    </div>
  )
}
export default Import
