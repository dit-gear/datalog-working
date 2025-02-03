import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@components/ui/alert-dialog'
import replaceTags from '@shared/utils/formatDynamicString'
import { ProjectRootType } from '@shared/projectTypes'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import LoadingDialog from '@components/LoadingDialog'

interface DefaultsDialogProps {
  project: ProjectRootType
  tags: any
  disabled: boolean
}

function hasDefaultPaths(project: ProjectRootType): boolean {
  return (
    (Array.isArray(project.default_ocf_paths) && project.default_ocf_paths.length > 0) ||
    (Array.isArray(project.default_sound_paths) && project.default_sound_paths.length > 0) ||
    (typeof project.default_proxy_path === 'string' && project.default_proxy_path.trim().length > 0)
  )
}

const DefaultsDialog = ({ project, tags, disabled }: DefaultsDialogProps) => {
  const [open, setOpen] = useState<boolean>(!disabled && hasDefaultPaths(project))
  const [loadingOpen, setLoadingOpen] = useState<boolean>(false)
  const { setValue } = useFormContext()
  const defaultPaths = {
    'OCF Paths': (project.default_ocf_paths || []).map((path) => replaceTags(path, tags)),
    'Sound Paths': (project.default_sound_paths || []).map((path) => replaceTags(path, tags)),
    'Proxy Path': project.default_proxy_path ? [replaceTags(project.default_proxy_path, tags)] : []
  }

  const handleImportDefaults = async () => {
    console.log('handleImportRun')
    const Paths = {
      ocf: defaultPaths['OCF Paths'].length > 0 ? defaultPaths['OCF Paths'] : null,
      sound: defaultPaths['Sound Paths'].length > 0 ? defaultPaths['Sound Paths'] : null,
      proxy: defaultPaths['Proxy Path'].length > 0 ? defaultPaths['Proxy Path'][0] : null
    }
    setOpen(false)
    setLoadingOpen(true)
    try {
      const res = await window.mainApi.getDefaultClips(Paths)
      if (res.success) {
        res.clips.ocf && setValue('ocf.clips', res.clips.ocf)
        res.clips.sound && setValue('sound.clips', res.clips.sound)
        res.clips.proxy && setValue('proxy.clips', res.clips.proxy)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingOpen(false)
    }
  }
  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import from default paths?</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              {Object.entries(defaultPaths).map(
                ([key, paths]) =>
                  paths.length > 0 && (
                    <span key={key}>
                      <strong>{key}:</strong>
                      {paths.length > 1 ? (
                        <ul>
                          {paths.map((path, index) => (
                            <li key={index}>{path}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{paths[0]}</span>
                      )}
                    </span>
                  )
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Skip</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportDefaults}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LoadingDialog open={loadingOpen} />
    </div>
  )
}

export default DefaultsDialog
