import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
  FormMessage
} from '@components/ui/form'
import { Input } from '@components/ui/input'

interface FormRowProps {
  name: string
  label: string
  description?: string
  descriptionTag?: string | string[]
  placeholder?: string
  disabled?: boolean
}

const FormRow: React.FC<FormRowProps> = ({
  name,
  label,
  description,
  descriptionTag,
  placeholder,
  disabled
}) => {
  return (
    <FormField
      key={name}
      name={name}
      render={({ field }) => (
        <FormItem className='"px-4 grid max-w-3xl grid-cols-1 grid-rows-[auto auto auto] md:grid-cols-6 md:gap-x-16 md:gap-y-4 md:px-0'>
          <FormLabel className="md:col-span-2 md:row-span-1 md:mt-5">{label}</FormLabel>
          <div className="flex flex-col row-start-3 md:col-span-2 md:row-start-2 md:row-span-2 gap-1.5">
            <FormDescription>{description}</FormDescription>
            <FormDescription className="text-sm text-gray-500 italic">
              {Array.isArray(descriptionTag) ? (
                descriptionTag.map((tag, index) => (
                  <span key={index} className="block">
                    {tag}
                  </span>
                ))
              ) : (
                <span>{descriptionTag}</span>
              )}
            </FormDescription>
          </div>
          <div className="flex flex-col text-sm text-gray-400 min-h-24 md:col-span-3 md:row-span-2 gap-2">
            <FormControl>
              <Input placeholder={placeholder} disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

export default FormRow
