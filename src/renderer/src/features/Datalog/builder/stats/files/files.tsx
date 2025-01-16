import { useEffect, useState } from 'react'
import { FilesPopupForm } from '../forms/FilesPopupForm'
import { useFormContext, useWatch } from 'react-hook-form'
import { formatBytes } from '@shared/utils/format-bytes'
import Stat from '@components/stat'
import { OCF } from '@shared/datalogTypes'
import { formatGroupedVolumes } from '@shared/utils/format-copies'
import { fileFormType } from '../forms/FilesPopupForm'
import { FilesStat } from './filesStat'
import { countClipFiles, sumClipSizes } from '@shared/utils/datalog-methods'
import z from 'zod'

const schema = z.object({
  files: OCF.shape.files.nullable(),
  size: OCF.shape.size.nullable(),
  clips: OCF.shape.clips,
  copies: OCF.shape.copies.nullable().optional()
})
type watched = z.infer<typeof schema>

interface FilesProps {
  type: 'ocf' | 'sound' | 'proxy'
}

const Files = ({ type }: FilesProps) => {
  const { setValue } = useFormContext()
  const enableCopies = type !== 'proxy'
  const fields = [`${type}.files`, `${type}.size`, `${type}.clips`]
  if (enableCopies) {
    fields.push(`${type}.copies`)
  }
  const ocfWatch = useWatch({
    name: fields
  })

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
    const obj = {
      files: ocfWatch[0],
      size: ocfWatch[1],
      clips: ocfWatch[2],
      ...(enableCopies && { copies: ocfWatch[3] })
    } as watched
    const size = obj.size ?? sumClipSizes(obj.clips)
    const [sizeDisplay, sizeUnitDisplay] = formatBytes(size, { output: 'tuple' })

    const baseValues = {
      files: obj.files ?? countClipFiles(obj.clips),
      ...(enableCopies && { copies: obj.copies ?? formatGroupedVolumes(obj.clips) })
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
      obj.files || obj.size || obj.copies || (obj.clips && obj.clips.length > 0)
        ? displayValues
        : null
    )
    setForm(formValues)
  }, [ocfWatch])

  const update = (newValue: fileFormType) => {
    console.log(newValue)
    if (newValue.files) setValue(`${type}.files`, newValue.files)
    if (newValue.size) setValue(`${type}.size`, newValue.size)
    if (enableCopies && newValue.copies) setValue(`${type}.copies`, newValue.copies)
  }

  const clear = () => {
    setValue(`${type}.files`, null)
    setValue(`${type}.size`, null)
    if (enableCopies) setValue(`${type}.copies`, null)
  }

  return (
    <FilesPopupForm
      key={type}
      value={form}
      update={update}
      clear={clear}
      header={type}
      enableCopies={enableCopies}
    >
      <Stat label={type} uppercase={type === 'ocf'}>
        <FilesStat value={display} />
      </Stat>
    </FilesPopupForm>
  )
}

export default Files
