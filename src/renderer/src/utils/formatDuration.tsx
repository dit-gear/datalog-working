import { durationType } from '@types'

const formatDuration = (totalSeconds: number): durationType => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return { hours, minutes }
}

export default formatDuration
