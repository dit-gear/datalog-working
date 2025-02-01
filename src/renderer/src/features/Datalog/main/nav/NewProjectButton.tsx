import { Button } from '@components/ui/button'
import { Plus, Clapperboard } from 'lucide-react'
import { useProject } from '../../hooks/useProject'
import { useNavigate } from 'react-router-dom'

const NewProjectButton = () => {
  const { data: project } = useProject()
  const navigate = useNavigate()
  if (project?.data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 items-center">
          <Clapperboard className="size-16" />
          <h1 className="text-xl font-bold">No Project Loaded</h1>
        </div>

        <Button onClick={() => navigate('/new-project')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    )
  } else return null
}

export default NewProjectButton
