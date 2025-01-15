import Duration from './duration/duration'
import Reels from './reels/reels'
import Files from './files/files'

const StatsPanel = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Files type="ocf" />
      <Files type="proxy" />
      <Files type="sound" />
      <Duration />
      <Reels />
    </div>
  )
}

export default StatsPanel
