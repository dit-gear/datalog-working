import { useState } from 'react'
import { formatCopiesFromClips } from '@shared/utils/format-copies'
import { Button } from '@components/ui/button'
import { mergeDirtyValues } from '../../../utils/merge-clips'
import { CopyType, OcfClipType, ProxyType } from '@shared/datalogTypes'
import { useFormContext, useWatch } from 'react-hook-form'
import { CopiesList } from './CopiesList'
import { Plus } from 'lucide-react'

export const Import = ({ project }) => {
  const { getValues, setValue, reset, resetField, formState } = useFormContext()

  const updateOcfClips = (newClips: OcfClipType[]) => {
    const dirtyFields = formState.dirtyFields.ocf?.clips
    console.log('dirty: ', dirtyFields)
    const currentClips = getValues('ocf.clips')

    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    console.log('mergedClips:', mergedClips)
    resetField('ocf.clips', { defaultValue: mergedClips, keepDirty: true })
    setValue('ocf.clips', mergedClips)
  }

  const updateProxyClips = (newClips: ProxyType[]) => {
    const dirtyFields = formState.dirtyFields.proxyClips
    const currentClips = getValues().proxyClips
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)
    reset({ ...getValues(), proxyClips: mergedClips }, { keepDirty: true })
  }

  const handleRemoveOcfCopy = async (copy: CopyType): Promise<void> => {
    try {
      const res = await window.mainApi.removeLogPath(copy.volumes)
      if (res.success) {
        res.clips.ocf && updateOcfClips(res.clips.ocf)
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

  const handleAddCopy = async (): Promise<void> => {
    try {
      const res = await window.mainApi.findOcf()
      if (res.success) {
        res.clips.ocf && updateOcfClips(res.clips.ocf)
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
        res.clips.proxy && updateProxyClips(res.clips.proxy)
      } else {
        if (res.cancelled) return
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveProxies = async (): Promise<void> => {
    /*try {
          const res = await window.mainApi.removeProxies()
          if (res.success) {
            //updateClips(res.clips)
          } else {
            console.error(res.error)
          }
        } catch (error) {
          console.error(error)
        }*/
  }

  const handleGetCsv = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getCsvMetadata()
      if (res.success) {
        console.log('getcsv-res:', res.clips)
        //updateClips(res.clips)
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
            <Button onClick={handleAddCopy} variant="secondary">
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
            <Button onClick={handleAddCopy} variant="secondary">
              {' '}
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
