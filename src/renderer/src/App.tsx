import { useState, useEffect } from 'react'
import { DatalogType } from '@shared/datalogTypes'
import { ProjectType } from '@shared/projectTypes'
import NewProjectDialog from './components/newProjectDialog'
import Entrydialogtrigger from './features/Datalog/entrydialogtrigger'
import Settings from './features/Settings/Settings'
import Datalogtable from './components/datalogtable'
import ProgressDialog from './components/progressdialog'
import { Toaster } from '@components/ui/toaster'
import { Button } from '@components/ui/button'
import { FolderSync } from 'lucide-react'

function App(): JSX.Element {
  const [project, setProject] = useState<ProjectType>()
  const [logs, setLogs] = useState<DatalogType[]>()

  const handleEntriesLoad = async (): Promise<void> => {
    try {
      const res = await window.api.loadDatalogs()
      if (res.success) {
        setLogs(res.datalogs)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleProjectLoad = (project: ProjectType): void => {
    console.log('Project loaded', project)
    setProject(project)
    handleEntriesLoad()
  }

  useEffect(() => {
    window.api.onProjectLoaded((project) => {
      handleProjectLoad(project)
    })
  }, [])

  return (
    <>
      <div className="container flex flex-col mx-auto w-full h-dvh sm:px-6 lg:px-8 bg-zinc-950">
        <div>
          <h1 className="text-2xl mt-2 font-bold text-white">Datalog.email</h1>
          <h2>{project?.data?.project_name}</h2>
        </div>
        <div>
          {project?.data ? (
            <div className="flex justify-end gap-4">
              <Entrydialogtrigger
                project={project.data}
                previousEntries={logs}
                refetch={handleEntriesLoad}
              />
              <Button variant="secondary" size="icon">
                <FolderSync className="h-4 w-4" />
              </Button>
              <Settings defaults={project.data.settings} setProject={setProject} />
            </div>
          ) : null}
        </div>
        {logs && (
          <div className="grow">
            <Datalogtable log={logs} />
          </div>
        )}

        {project?.data ? (
          <div className="flex justify-end gap-4"></div>
        ) : (
          <div className="">
            <div className="flex flex-col mt-60 place-items-center gap-4">
              <p> No project loaded</p>
            </div>
          </div>
        )}
        <div className="flex flex-col mt-4 place-items-center gap-4">
          {project?.rootPath && (
            <NewProjectDialog
              showbtn={project?.projectPath ? false : true}
              setActiveProject={handleProjectLoad}
            />
          )}
        </div>
      </div>
      <ProgressDialog />
      <Toaster />
    </>
  )
}

export default App
