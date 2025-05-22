import { useWatch } from 'react-hook-form'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import WarningTooltip from '@components/WarningTooltip'

interface WarningPresetsProps {
  templates: TemplateDirectoryFile[]
}

const WarningPresets = ({ templates }: WarningPresetsProps) => {
  const [project_pdfs, global_pdfs, project_emails, global_emails] = useWatch({
    name: ['project_pdfs', 'global_pdfs', 'project_emails', 'global_emails'] // array of paths
  })

  // Validate that each watched item has a 'react' prop and that it exists in the templates list by name
  const watchedArrays = [project_pdfs, global_pdfs, project_emails, global_emails]
  const allValid = watchedArrays
    .flat()
    .every((item) => item.react && templates.some((t) => t.name === item.react))

  if (!allValid) {
    return <WarningTooltip text="Some presets reference missing or invalid templates" />
  }

  return
}

export default WarningPresets
