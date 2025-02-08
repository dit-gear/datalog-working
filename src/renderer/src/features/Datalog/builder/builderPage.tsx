import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useDatalogs } from '../hooks/useDatalogs'
import Builder from './builder'
import { Button } from '@components/ui/button'

function BuilderPage() {
  const navigate = useNavigate()
  const { logId } = useParams<{ logId?: string }>()
  const { data: project, isLoading: projectsLoading } = useProject()
  const { data: logs, isLoading: datalogsLoading } = useDatalogs()

  const selectedLog = logs.find((log) => log.id === logId)

  if (projectsLoading || datalogsLoading || !project?.data) {
    return null
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2>{logId ? `Edit Shooting Day: ${logId}` : 'New Shooting Day'}</h2>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back
        </Button>
      </div>
      <Builder project={project.data} previousEntries={logs} selected={selectedLog} />
    </div>
  )
}

export default BuilderPage
