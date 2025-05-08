import { useProject } from '../../hooks/useProject'
import { useNavigate } from 'react-router-dom'
import EmptyStateCard from '@components/EmptyStateCard'

const NewProjectButton = () => {
  const { data: project, isLoading } = useProject()
  const navigate = useNavigate()
  if (!project && !isLoading) {
    return (
      <EmptyStateCard
        title="No project Loaded"
        buttonLabel="New Project"
        buttonAction={() => navigate('/new-project')}
      />
    )
  } else return null
}

export default NewProjectButton
