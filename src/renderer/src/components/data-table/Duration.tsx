import { useFormContext } from 'react-hook-form'
import { DurationPopupForm } from './DurationPopupForm'

const DurationCell = ({ row, column, value }) => {
  const { setValue } = useFormContext()
  const field = `Clips.${row.id}.${column.id}`
  const update = (newValue: number) => {
    setValue(field, newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }
  return <DurationPopupForm value={value} update={update} cliptowatch={field} />
}
export default DurationCell
