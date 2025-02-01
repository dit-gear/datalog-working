import Table from './table/Table'
import { Toaster } from '@components/ui/toaster'
import { SelectedProvider } from './SelectedContext'
import SendButton from './nav/SendButton'
import ExportButton from './nav/ExportButton'
import BuilderButton from './nav/BuilderButton'
import SettingsButton from './nav/SettingsButton'
import { useIpcNavigation } from '../hooks/useIpcNavigation'
import { useProject } from '../hooks/useProject'
import { useDatalogs } from '../hooks/useDatalogs'
import { useIpcListeners } from '../hooks/useIpcListeners'
import { Loader2 } from 'lucide-react'

function Main() {
  useIpcNavigation()
  useIpcListeners()

  const { data: project } = useProject()
  const { data: logs, isLoading } = useDatalogs()

  return (
    <div>
      <SelectedProvider>
        <div className="container flex flex-col mx-auto w-full sm:px-6 lg:px-8 bg-zinc-950">
          <div>
            <h1 className="text-2xl mt-2 font-bold text-white">Datalog.email</h1>
            <h2>{project?.data?.project_name}</h2>
          </div>
          <div className="flex justify-end gap-4">
            <SendButton />
            <ExportButton />
            <BuilderButton />
            <SettingsButton />
          </div>
          {logs && (
            <div className="grow">
              <Table logs={logs} />
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col mt-60 place-items-center gap-4">
              <Loader2 className="animate-spin" />
            </div>
          )}
          <div className="flex flex-col mt-4 place-items-center gap-4">
            {/*project?.rootPath && !project?.projectPath && (
              <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <NewProjectDialog
                  setActiveProject={handleProjectLoad}
                  open={newProjectOpen}
                  setOpen={setNewProjectOpen}
                />
              </Dialog>
            )*/}
          </div>
        </div>
        <Toaster />
      </SelectedProvider>
    </div>
  )
}

export default Main
