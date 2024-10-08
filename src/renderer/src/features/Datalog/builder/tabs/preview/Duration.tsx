import { useFormContext, useWatch } from 'react-hook-form'
import { DurationPopupForm } from '../../stats/forms/DurationPopupForm'
import { formatDuration } from '@shared/utils/format-duration'

const DurationCell = ({ row, column, value }) => {
  const { setValue } = useFormContext()
  const field = `Clips.${row.id}.${column.id}`
  const valueInSync = useWatch({ name: field })
  const update = (newValue: number) => {
    setValue(field, newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }
  return (
    <DurationPopupForm value={value} update={update} sec>
      <span className="whitespace-nowrap">
        {formatDuration(valueInSync, { asString: true, unit: 'ms' })}
      </span>
    </DurationPopupForm>
  )
}
export default DurationCell
