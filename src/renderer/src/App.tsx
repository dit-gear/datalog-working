import { useState, useEffect } from 'react'
import { entryType } from '@shared/shared-types'
import { ProjectType } from '@shared/projectTypes'
import NewProjectDialog from './components/newProjectDialog'
import Entrydialogtrigger from '@components/entrydialogtrigger'
import Settings from './features/Settings/settings'
import Datalogtable from './components/datalogtable'
import ProgressDialog from './components/progressdialog'
import { Toaster } from '@components/ui/toaster'
import { Button } from '@components/ui/button'
import { Settings2, FolderSync } from 'lucide-react'

function App(): JSX.Element {
  const [project, setProject] = useState<ProjectType>()
  const [settingspage, setSettingspage] = useState<boolean>(false)
  const [entries, setEntries] = useState<entryType[]>()

  const handleEntriesLoad = (): void => {
    window.api.loadEntries().then((entries) => {
      setEntries(entries)
      console.log('Entries loaded', entries)
    })
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
        <div onClick={() => setSettingspage(false)}>
          <h1 className="text-2xl mt-2 font-bold text-white">Datalog.email</h1>
          <h2>{project?.data?.project_name}</h2>
        </div>
        <div>
          <div className="px-4 sm:px-0">
            <h2 className="text-xl font-fold">Settings</h2>
          </div>
          {!settingspage && project?.data ? (
            <div className="flex justify-end gap-4">
              <Entrydialogtrigger
                settings={project.data}
                previousEntries={entries}
                refetch={handleEntriesLoad}
              />
              <Button variant="secondary" size="icon">
                <FolderSync className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" onClick={() => setSettingspage(true)}>
                <Settings2 className="h-4 w-4" />
              </Button>
              <Settings defaultSettings={project.data} />
            </div>
          ) : null}
        </div>
        {entries && !settingspage && (
          <div className="grow">
            <Datalogtable log={entries} />
          </div>
        )}
        {settingspage && project?.data && <Settings defaultSettings={project.data} />}

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
