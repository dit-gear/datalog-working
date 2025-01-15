import { CopyType, OcfClipType, SoundClipType } from '@shared/datalogTypes'
import { useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { formatCopiesFromClips } from '@shared/utils/format-copies'

interface CopiesListProps {
  type: 'ocf' | 'sound'
  handleRemoveCopy: (copy: CopyType, type: 'ocf' | 'sound') => void
}

export const CopiesList = ({ type, handleRemoveCopy }: CopiesListProps) => {
  const [copies, setCopies] = useState<CopyType[]>([])

  const clips: (OcfClipType | SoundClipType)[] = useWatch({ name: `${type}.clips` })

  useMemo(() => {
    const newCopies = clips?.length > 0 ? formatCopiesFromClips(clips) : []
    setCopies(newCopies)
  }, [clips])

  if (copies?.length > 0) {
    return (
      <ul role="list" className="divide-y divide-white/10 rounded-md border border-white/20 mb-2">
        {copies?.map((copy, index) => (
          <li
            key={index}
            className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
          >
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span className="flex-shrink-0 text-gray-400">Copy {index + 1}: </span>
                {copy?.volumes?.map((vol, volIndex) => (
                  <span key={volIndex} className="truncate font-medium">
                    {vol}
                    <span className="text-gray-400">
                      {volIndex < copy.volumes?.length - 1 && ', '}
                    </span>
                  </span>
                ))}
                <span className="flex-shrink-0 text-gray-400">
                  {copy.count[0]} of {copy.count[1]} Clips
                </span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <a
                href="#"
                onClick={() => handleRemoveCopy(copy, type)}
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Remove
              </a>
            </div>
          </li>
        ))}
      </ul>
    )
  } else {
    return null
  }
}
