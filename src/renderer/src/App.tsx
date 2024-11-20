import { useState, useEffect, useCallback } from 'react'
import { DatalogDynamicZod, DatalogType } from '@shared/datalogTypes'
import { ProjectType } from '@shared/projectTypes'
import NewProjectDialog from './components/newProjectDialog'
import Builderdialog from './features/Datalog/builder/builderDialog'
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog'
import { Plus, Send as SendIcon } from 'lucide-react'
import Settings from './features/Settings/Settings'
import Table from './features/Datalog/table/Table'
import ProgressDialog from './components/progressdialog'
import { Toaster } from '@components/ui/toaster'
import { Button } from '@components/ui/button'
import { Settings2 as SettingsIcon } from 'lucide-react'

function App(): JSX.Element {
  const [project, setProject] = useState<ProjectType>()
  const [logs, setLogs] = useState<DatalogType[]>()
  const [logEdit, setLogEdit] = useState<DatalogType>()
  const [builderOpen, setBuilderOpen] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [newProjectOpen, setNewProjectOpen] = useState<boolean>(false)

  const handleProjectLoad = (project: ProjectType): void => {
    console.log('Project loaded', project)
    setProject(project)
  }

  const handleBuilderClose = (open: boolean) => {
    if (logEdit) setLogEdit(undefined)
    setBuilderOpen(open)
  }

  const handleItemToEdit = useCallback((datalog: DatalogType): void => {
    setLogEdit(datalog)
    setBuilderOpen(true)
  }, [])

  useEffect(() => {
    window.api.onProjectLoaded((project) => {
      handleProjectLoad(project)
    })
  }, [])

  useEffect(() => {
    window.api.onDatalogsLoaded((datalogs: DatalogType[]) => {
      console.log(`datalogs: ${datalogs}`)
      setLogs(datalogs)
    })
  }, [])

  useEffect(() => {
    window.api.onOpenModalInDatalog((modal) => {
      // Todo: Handle so that only one is opened at the same time.
      switch (modal) {
        case 'new-shooting-day':
          if (builderOpen) return
          setBuilderOpen(true)
          break
        case 'project-settings':
          if (settingsOpen) return
          setSettingsOpen(true)
          break
        case 'new-project':
          if (newProjectOpen) return
          setNewProjectOpen(true)
          break
        default:
          break
      }
    })
  }, [])

  return (
    <div className="border-t">
      <div className="container flex flex-col mx-auto w-full h-dvh sm:px-6 lg:px-8 bg-zinc-950">
        <div>
          <h1 className="text-2xl mt-2 font-bold text-white">Datalog.email</h1>
          <h2>{project?.data?.project_name}</h2>
        </div>
        <div>
          {project?.data ? (
            <div className="flex justify-end gap-4">
              <Button onClick={() => window.api.openSendWindow()}>
                <SendIcon className="mr-2 h-4 w-4" />
                Send
              </Button>
              <Dialog open={builderOpen} onOpenChange={handleBuilderClose}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Shooting Day
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[80vw] h-[90vh]">
                  {builderOpen && (
                    <Builderdialog
                      project={project.data}
                      previousEntries={logs}
                      selected={logEdit}
                      setOpen={setBuilderOpen}
                    />
                  )}
                </DialogContent>
              </Dialog>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <Settings
                  defaults={project.data.settings}
                  templates={project.data.templatesDir}
                  setProject={setProject}
                  open={settingsOpen}
                  setOpen={setSettingsOpen}
                />
              </Dialog>
            </div>
          ) : null}
        </div>
        {logs && (
          <div className="grow">
            <Table logs={logs} handleEdit={handleItemToEdit} />
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
            <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
              {!project?.projectPath && (
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
              )}
              <NewProjectDialog
                setActiveProject={handleProjectLoad}
                open={newProjectOpen}
                setOpen={setNewProjectOpen}
              />
            </Dialog>
          )}
        </div>
      </div>
      <ProgressDialog />
      <Toaster />
    </div>
  )
}

export default App
