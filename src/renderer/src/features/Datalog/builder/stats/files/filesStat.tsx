import { fileFormType } from '../forms/FilesPopupForm'

interface FileStatProps {
  value: fileFormType | null
}

export const FilesStat = ({ value }: FileStatProps) => {
  return value ? (
    <span className="flex flex-col">
      <span className="flex items-end gap-2">
        <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
          {value.size}
        </span>
        <span className="text-sm text-gray-400">{`${value.sizeUnit}`}</span>
      </span>
      <span className="text-sm text-gray-400">
        <span>{`${value.files} clips`}</span>
        {value.copies && (
          <span>{`- ${value.copies?.length} ${value.copies.length > 1 ? 'copies' : 'copy'}`}</span>
        )}
      </span>
    </span>
  ) : null
}
