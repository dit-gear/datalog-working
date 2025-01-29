// renderer/pages/BuilderPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useDatalogs } from '../hooks/useDatalogs'
import Builderdialog from './builderDialog'
import { Button } from '@components/ui/button'

function BuilderPage() {
  const navigate = useNavigate()
  const { logId } = useParams<{ logId?: string }>()
  const { data: project } = useProject()
  const { data: logs, isLoading } = useDatalogs()

  const selectedLog = logs.find((log) => log.id === logId)
  console.log(selectedLog, logId)

  if (isLoading) {
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
      {project?.data ? (
        <Builderdialog
          project={project.data}
          previousEntries={logs}
          selected={selectedLog}
          setOpen={() => navigate('/')}
        />
      ) : (
        <p>Loading project...</p>
      )}
    </div>
  )
}

export default BuilderPage
