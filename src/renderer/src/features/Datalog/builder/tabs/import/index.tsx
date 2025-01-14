import { useState } from 'react'
import { formatCopiesFromClips } from '@shared/utils/format-copies'
import { Button } from '@components/ui/button'
import { mergeDirtyValues } from '../../../utils/merge-clips'
import { CopyType, CustomType, OcfClipType, ProxyType, SoundClipType } from '@shared/datalogTypes'
import { useFormContext, useWatch } from 'react-hook-form'
import { CopiesList } from './CopiesList'
import { Plus } from 'lucide-react'

export const Import = ({ project }) => {
  const { getValues, setValue, reset, resetField, formState } = useFormContext()

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
  /*
  const updateOcfClips = (newClips: OcfClipType[]) => {
    const dirtyFields = formState.dirtyFields.ocf?.clips
    console.log('dirty: ', dirtyFields)
    const currentClips = getValues('ocf.clips')
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    console.log('mergedClips:', mergedClips)
    resetField('ocf.clips', { defaultValue: mergedClips, keepDirty: true })
    setValue('ocf.clips', mergedClips)
  }

  const updateSoundClips = (newClips: SoundClipType[]) => {
    const dirtyFields = formState.dirtyFields.sound?.clips
    const currentClips = getValues('sound.clips')
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    resetField('sound.clips', { defaultValue: mergedClips, keepDirty: true })
    setValue('sound.clips', mergedClips)
  }

  const updateProxyClips = (newClips: ProxyType[]) => {
    const dirtyFields = formState.dirtyFields.proxy?.clips
    const currentClips = getValues('proxy.clips')
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    resetField('proxy.clips', { defaultValue: mergedClips, keepDirty: true })
    setValue('proxy.clips', mergedClips)
  }
  const updateCustomClips = (newClips: CustomType[]) => {
    const dirtyFields = formState.dirtyFields.custom
    const currentClips = getValues('custom')
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    resetField('custom', { defaultValue: mergedClips, keepDirty: true })
    setValue('custom', mergedClips)
  }*/

  const handleRemoveOcfCopy = async (copy: CopyType): Promise<void> => {
    try {
      const res = await window.mainApi.removeLogPath(copy.volumes)
      if (res.success) {
        res.clips.ocf && updateClips('ocf.clips', res.clips.ocf)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveSoundCopy = async (copy: CopyType): Promise<void> => {
    /*try {
      const res = await window.mainApi.removeLogPath(copy.volumes)
      if (res.success) {
        res.clips.ocf && updateOcfClips(res.clips.ocf, true)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }*/
  }

  const handleAddSoundCopy = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getSound()
      if (res.success) {
        console.log('success:', res.success)
        res.clips.sound && updateClips('sound.clips', res.clips.sound)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddOcfCopy = async (): Promise<void> => {
    try {
      const res = await window.mainApi.findOcf()
      if (res.success) {
        res.clips.ocf && updateClips('ocf.clips', res.clips.ocf)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleGetProxies = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getProxies()
      if (res.success) {
        res.clips.proxy && updateClips('proxy.clips', res.clips.proxy)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveProxies = async (): Promise<void> =>
    resetField('proxy.clips', { defaultValue: [], keepDirty: true })

  const handleGetCsv = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getCsvMetadata()
      if (res.success) {
        res.clips.custom && updateClips('custom', res.clips.custom)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">OCF</dt>
        <dd className="mt-2 text-sm text-white sm:col-span-2 sm:mt-0">
          <CopiesList key="ocf" type="ocf" handleRemoveCopy={handleRemoveOcfCopy} />
          <div className="flex gap-2">
            <Button onClick={handleAddOcfCopy} variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add OCF Folder
            </Button>
          </div>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Sound</dt>
        <dd className="mt-2 text-sm text-white sm:col-span-2 sm:mt-0">
          <CopiesList key="sound" type="sound" handleRemoveCopy={handleRemoveSoundCopy} />
          <div className="flex gap-2">
            <Button onClick={handleAddSoundCopy} variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add Sound Folder
            </Button>
          </div>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Proxies</dt>
        <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
          <Button onClick={handleGetProxies} variant="secondary">
            {' '}
            <Plus className="mr-2 h-4 w-4" />
            Add Proxies Folder
          </Button>
          <Button onClick={handleRemoveProxies} variant="outline">
            Remove
          </Button>
        </dd>
      </div>
      <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
        <dt className="text-sm font-medium leading-6 text-white">Custom Metadata</dt>
        <dd className="flex mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0 gap-4 items-center">
          <Button onClick={handleGetCsv} variant="secondary" disabled={!project}>
            Select CSV file
          </Button>
        </dd>
      </div>
    </>
  )
}
export default Import
