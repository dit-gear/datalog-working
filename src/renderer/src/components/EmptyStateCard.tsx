import { Button } from './ui/button'
import { Plus, Clapperboard } from 'lucide-react'

interface EmptyStateCardProps {
  title: string
  buttonLabel: string
  buttonAction: () => void
}

const EmptyStateCard = ({ title, buttonLabel, buttonAction }: EmptyStateCardProps) => {
  return (
    <div className="flex flex-col gap-6 place-items-center mt-60">
      <div className="flex flex-col gap-3 items-center">
        <Clapperboard className="size-16" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      <Button onClick={buttonAction}>
        <Plus className="mr-2 h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  )
}

export default EmptyStateCard
