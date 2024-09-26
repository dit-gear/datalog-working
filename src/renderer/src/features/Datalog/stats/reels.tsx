import Stat from '@components/stat'
import { useWatch } from 'react-hook-form'
import { getReels } from '@renderer/utils'

const Reels = () => {
  const reels = useWatch({ name: 'Clips' })
  return <Stat key="stats-reels" label="Reels" value={getReels(reels).join(', ')} small />
}

export default Reels
