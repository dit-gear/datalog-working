import Stat from '@components/stat'
import { useWatch } from 'react-hook-form'
import { formatDuration } from '@renderer/utils/format-duration'
import { ClipType } from '@shared/datalogTypes'

const getDuration = (clips: ClipType[]): number =>
  clips.reduce((acc, clip) => acc + (clip.Duration || 0), 0)

const Duration = () => {
  const clips: ClipType[] = useWatch({ name: 'Clips' })
  const duration = getDuration(clips)
  return <Stat key="stats-duration" label="Duration" duration={formatDuration(duration)} />
}

export default Duration
