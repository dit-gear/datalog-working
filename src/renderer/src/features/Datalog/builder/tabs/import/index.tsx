import { Button } from '@components/ui/button'
import { mergeDirtyValues } from '../../../utils/merge-clips'
import { CopyType, CustomType, OcfClipType, ProxyType, SoundClipType } from '@shared/datalogTypes'
import { useFormContext } from 'react-hook-form'
import { CopiesList } from './CopiesList'
import { Plus } from 'lucide-react'

export const Import = ({ project }) => {
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
    <>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">OCF</dt>
        <dd className="mt-2 text-sm text-white sm:col-span-2 sm:mt-0">
          <CopiesList key="ocf" type="ocf" handleRemoveCopy={handleRemoveClips} />
          <div className="flex gap-2">
            <Button onClick={() => handleAddClips('ocf')} variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add OCF Folder
            </Button>
          </div>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Sound</dt>
        <dd className="mt-2 text-sm text-white sm:col-span-2 sm:mt-0">
          <CopiesList key="sound" type="sound" handleRemoveCopy={handleRemoveClips} />
          <div className="flex gap-2">
            <Button onClick={() => handleAddClips('sound')} variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add Sound Folder
            </Button>
          </div>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Proxies</dt>
        <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
          <Button onClick={() => handleAddClips('proxy')} variant="secondary">
            {' '}
            <Plus className="mr-2 h-4 w-4" />
            Add Proxies Folder
          </Button>
          <Button onClick={() => handleRemoveClipsLocal('proxy')} variant="outline">
            Remove
          </Button>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Custom Metadata</dt>
        <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
          <Button onClick={() => handleAddClips('custom')} variant="secondary" disabled={!project}>
            Select CSV file
          </Button>
          <Button onClick={() => handleRemoveClipsLocal('custom')} variant="outline">
            Remove
          </Button>
        </dd>
      </div>
    </>
  )
}
export default Import
