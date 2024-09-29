import { useFormContext, useWatch } from 'react-hook-form'
import { DurationPopupForm } from '../../features/Datalog/stats/forms/DurationPopupForm'
import { formatDurationToString } from '@renderer/utils/format-duration'

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
      <span className="whitespace-nowrap">{formatDurationToString(valueInSync)}</span>
    </DurationPopupForm>
  )
}
export default DurationCell
