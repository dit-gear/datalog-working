import { Button } from '@components/ui/button'
import { mergeDirtyValues } from '../../../utils/merge-clips'
import { CopyType, CustomType, OcfClipType, ProxyType, SoundClipType } from '@shared/datalogTypes'
import { useFormContext } from 'react-hook-form'
import { CopiesList } from './CopiesList'
import { Plus, X, Delete } from 'lucide-react'
import { Label } from '@components/ui/label'
import { Section } from './section'
import { ProjectRootType } from '@shared/projectTypes'

interface ImportProps {
  project: ProjectRootType
}

export const Import = ({ project }: ImportProps) => {
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
      const res = await window.mainApi.getClips(type)
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
    }
  }

  /** Used for removing clips that is stored in both main process and renderer */
  const handleRemoveClips = async (copy: CopyType, type: 'ocf' | 'sound'): Promise<void> => {
    try {
      const res = await window.mainApi.removeClips(copy.volumes, type)
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
    <div className="space-y-16 px-32">
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
      {/*<div>
        <Label htmlFor="ocf-copies" className="text-base">
          {`Original Camera Files (OCF)`}
        </Label>
        <p className="text-muted-foreground text-sm">102 clips added</p>
        <CopiesList key="ocf" type="ocf" handleRemoveCopy={handleRemoveClips} />
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips('ocf')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Folder
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="sound-copies" className="text-base">
          Sound
        </Label>
        <p className="text-muted-foreground text-sm">42 clips added</p>
        <CopiesList key="sound" type="sound" handleRemoveCopy={handleRemoveClips} />
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips('sound')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Folder
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="proxies" className="text-base">
          Proxies
        </Label>
        <p className="text-muted-foreground text-sm">40 clips added</p>
        <div id="proxies" className="mt-2 flex gap-4">
          <Button size="sm" onClick={() => handleAddClips('proxy')} variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Folder
          </Button>
          <Button size="sm" onClick={() => handleRemoveClipsLocal('proxy')} variant="destructive">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="custom-metadata" className="text-base">
          Custom Metadata
        </Label>
        <p className="text-muted-foreground text-sm">Enable Custom Fields to enable this option</p>
        <div id="custom-metadata" className="mt-2 flex gap-4">
          <Button size="sm" onClick={() => handleAddClips('custom')} disabled>
            <Plus className="mr-2 h-4 w-4" />
            Select CSV file
          </Button>
          {/*<Button size="sm" onClick={() => handleRemoveClipsLocal('custom')} variant="destructive">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>*/}
    </div>
  )
}
export default Import
