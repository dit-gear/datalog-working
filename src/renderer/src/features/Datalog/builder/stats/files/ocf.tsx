import { useEffect, useState } from 'react'
import { FilesPopupForm } from '../forms/FilesPopupForm'
import { useFormContext, useWatch } from 'react-hook-form'
import { formatBytes } from '@shared/utils/format-bytes'
import Stat from '@components/stat'
import { OcfClipType, OcfType, OCF } from '@shared/datalogTypes'
import { formatGroupedVolumes } from '@shared/utils/format-copies'
import { fileFormType } from '../forms/FilesPopupForm'
import { FilesStat } from './filesStat'
import { useDebounce } from '@renderer/utils/useDebounce'
import { countClipFiles, sumClipSizes } from '@shared/utils/datalog-methods'
import z from 'zod'

const schema = z.object({
  files: OCF.shape.files.nullable(),
  size: OCF.shape.size.nullable(),
  copies: OCF.shape.copies.nullable(),
  clips: OCF.shape.clips
})
type watched = z.infer<typeof schema>

const Ocf = () => {
  const { setValue } = useFormContext()
  const ocfWatch = useWatch({ name: ['ocf.files', 'ocf.size', 'ocf.copies', 'ocf.clips'] })

  /*const ocf = useDebounce(
    {
      files: ocfWatch[0],
      size: ocfWatch[1],
      copies: ocfWatch[2],
      clips: ocfWatch[3]
    } as watched,
    300
  )*/

  const [form, setForm] = useState<fileFormType | null>(null)
  const [display, setDisplay] = useState<fileFormType | null>(null)

  useEffect(() => {
    console.count('updated')
    const ocf = {
      files: ocfWatch[0],
      size: ocfWatch[1],
      copies: ocfWatch[2],
      clips: ocfWatch[3]
    } as watched
    const size = ocf.size ?? sumClipSizes(ocf.clips)
    const [sizeDisplay, sizeUnitDisplay] = formatBytes(size, { output: 'tuple' })

    const baseValues = {
      files: ocf.files ?? countClipFiles(ocf.clips),
      copies: ocf.copies ?? formatGroupedVolumes(ocf.clips)
    }

    const formValues = {
      ...baseValues,
      size: size,
      sizeUnit: 'gb' as 'gb'
    }

    const displayValues = {
      ...baseValues,
      size: sizeDisplay,
      sizeUnit: sizeUnitDisplay as 'tb' | 'gb' | 'mb'
    }

    setDisplay(
      ocf.files || ocf.size || ocf.copies || (ocf.clips && ocf.clips.length > 0)
        ? displayValues
        : null
    )
    setForm(formValues)
  }, [ocfWatch])

  const update = (newValue: fileFormType) => {
    console.log(newValue)
    if (newValue.files) setValue('ocf.files', newValue.files)
    if (newValue.size) setValue('ocf.size', newValue.size)
    if (newValue.copies) setValue('ocf.copies', newValue.copies)
  }

  const clear = () => {
    setValue('ocf.files', null)
    setValue('ocf.size', null)
    setValue('ocf.copies', null)
  }

  return (
    <FilesPopupForm key="ocf" value={form} update={update} clear={clear} header="OCF" enableCopies>
      <Stat label="OCF">
        <FilesStat value={display} />
      </Stat>
    </FilesPopupForm>
  )
}

export default Ocf
