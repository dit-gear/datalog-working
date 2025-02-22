import { Label } from '@components/ui/label'
import { ReactNode } from 'react'

interface FormRowProps {
  name?: string
  label: string
  description?: string
  descriptionTag?: string | string[]
  children: ReactNode
}

const FormRow: React.FC<FormRowProps> = ({
  name,
  label,
  description,
  descriptionTag,
  children
}) => {
  return (
    <div className="px-4 py-6 sm:grid xl:grid-cols-[16rem,_1fr] sm:gap-4 sm:px-0">
      <div>
        <Label htmlFor={name} className="text-base">
          {label}
        </Label>
        <div className="flex flex-col gap-1.5 text-muted-foreground max-w-40">
          <p className="text-sm ">{description}</p>
          <p className="text-xs italic">
            {Array.isArray(descriptionTag) ? (
              descriptionTag.map((tag, index) => (
                <span key={index} className="block">
                  {tag}
                </span>
              ))
            ) : (
              <span>{descriptionTag}</span>
            )}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default FormRow
