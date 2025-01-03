import Ocf from './ocf'
import Proxy from './proxy'
import Duration from './duration'
import Reels from './reels'

const StatsPanel = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Ocf />
      <Proxy />
      <Duration />
      <Reels />
    </div>
  )
}

export default StatsPanel
