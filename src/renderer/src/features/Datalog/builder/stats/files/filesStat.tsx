import { fileFormType } from '../forms/FilesPopupForm'

interface FileStatProps {
  value: fileFormType | null
}

export const FilesStat = ({ value }: FileStatProps) => {
  return value ? (
    <>
      <span className="text-4xl font-semibold leading-none tracking-tight text-white line-clamp-3">
        {value.size}
      </span>
      <span className="text-sm text-gray-400">{`${value.sizeUnit} (${value.files} clips)`}</span>
    </>
  ) : null
}
