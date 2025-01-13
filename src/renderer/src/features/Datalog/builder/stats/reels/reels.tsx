import { useState, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ReelsPopupForm } from '../forms/ReelsPopupForm'
import { getReels } from '@shared/utils/datalog-methods'
import { OcfClipType } from '@shared/datalogTypes'
import { ReelsStat } from './reelsStat'

const Reels = () => {
  const { setValue } = useFormContext()
  const clips: OcfClipType[] = useWatch({ name: 'ocf.clips' })
  const fixedReels: string[] | null = useWatch({ name: 'ocf.reels' })

  const [reels, setReels] = useState<string[]>([])
  const [reelsGrouped, setReelsGrouped] = useState<string[]>([])

  useEffect(() => {
    const reels = getReels(
      { reels: fixedReels ? fixedReels : undefined, clips: clips },
      { grouped: false }
    )
    const reelsGrouped = getReels(
      { reels: fixedReels ? fixedReels : undefined, clips: clips },
      { grouped: true }
    )
    setReels(reels)
    setReelsGrouped(reelsGrouped)
  }, [clips, fixedReels])

  const update = (newValue: string[]) => {
    newValue.length > 0 ? setValue('ocf.reels', newValue) : clear()
  }

  const clear = () => {
    setValue('ocf.reels', null)
  }

  return (
    <ReelsPopupForm value={reels} update={update} clear={clear}>
      <ReelsStat reels={reelsGrouped} />
    </ReelsPopupForm>
  )
}

export default Reels
